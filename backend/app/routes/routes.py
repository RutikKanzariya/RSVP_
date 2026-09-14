import random
import asyncio
from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from datetime import datetime
from uuid import uuid4

from app.models.schemas import InviteeModel, CampaignModel, CampaignInviteeModel, CallResultModel
from app.services.calling_service import CallingService
from app.database import db

router = APIRouter()

# In-memory storage fallback if MongoDB connection fails or for local test speed
in_memory_db = {
    "invitees": [
        {"_id": "inv_1", "externalId": "1", "name": "Rahul Sharma", "phone": "+919876543210", "email": "rahul.sharma@techcorp.in", "company": "TechCorp India", "raw_row_valid": True, "validation_errors": [], "createdAt": datetime.utcnow()},
        {"_id": "inv_2", "externalId": "2", "name": "Priya Shah", "phone": "+919812345678", "email": "priya.shah@innovate.com", "company": "Innovate Solutions", "raw_row_valid": True, "validation_errors": [], "createdAt": datetime.utcnow()},
        {"_id": "inv_3", "externalId": "3", "name": "Amit Patel", "phone": "+919999999999", "email": "amit.patel@globalvoxinc.com", "company": "GlobalVox", "raw_row_valid": True, "validation_errors": [], "createdAt": datetime.utcnow()}
    ],
    "campaigns": [
        {
            "_id": "camp_001",
            "campaignName": "Annual Business Meet — RSVP",
            "eventName": "GlobalVox Annual Business Meet 2026",
            "eventDate": "2026-10-25",
            "location": "Ahmedabad",
            "objective": "Determine attendance & dietary requirements.",
            "status": "running",
            "totalInvitees": 3,
            "invalidRows": 0,
            "startedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow()
        }
    ],
    "campaign_invitees": [
        {"_id": "ci_1", "campaignId": "camp_001", "inviteeId": "inv_1", "name": "Rahul Sharma", "phone": "+919876543210", "email": "rahul.sharma@techcorp.in", "status": "confirmed", "attemptCount": 1, "maxAttempts": 3, "lastAttemptAt": datetime.utcnow(), "notes": "Confirmed attendance. Vegetarian meal requested."},
        {"_id": "ci_2", "campaignId": "camp_001", "inviteeId": "inv_2", "name": "Priya Shah", "phone": "+919812345678", "email": "priya.shah@innovate.com", "status": "declined", "attemptCount": 1, "maxAttempts": 3, "lastAttemptAt": datetime.utcnow(), "notes": "Out of town."},
        {"_id": "ci_3", "campaignId": "camp_001", "inviteeId": "inv_3", "name": "Amit Patel", "phone": "+919999999999", "email": "amit.patel@globalvoxinc.com", "status": "pending", "attemptCount": 0, "maxAttempts": 3}
    ],
    "call_results": []
}

# --- INVITEES ENDPOINTS ---
@router.get("/invitees")
async def get_invitees():
    if db.db is not None:
        try:
            cursor = db.db["invitees"].find()
            invitees = await cursor.to_list(length=1000)
            return {"invitees": invitees}
        except Exception:
            pass
    return {"invitees": in_memory_db["invitees"]}

@router.post("/invitees")
async def create_invitee(payload: Dict[str, Any] = Body(...)):
    items = payload.get("items", [])
    generate_count = payload.get("generate_count")

    if generate_count and isinstance(generate_count, int):
        first_names = ["Aarav", "Priya", "Rahul", "Ananya", "Rohan", "Sneha", "Vikram", "Neha", "Amit", "Kavya", "Rajesh", "Pooja"]
        last_names = ["Sharma", "Patel", "Shah", "Gupta", "Verma", "Mehta", "Joshi", "Trivedi", "Chopra", "Nair"]
        companies = ["TechCorp India", "Innovate Global", "GlobalVox", "Nexus AI", "Apex Systems", "Starlight Media"]

        added_docs = []
        for i in range(1, generate_count + 1):
            fn = random.choice(first_names)
            ln = random.choice(last_names)
            comp = random.choice(companies)
            is_valid = (i % 15 != 0)  # 1 in 15 has format error for validation test
            
            inv = {
                "_id": f"inv_syn_{uuid4().hex[:8]}",
                "externalId": str(1000 + i),
                "name": f"{fn} {ln}",
                "phone": f"+919{random.randint(100000000, 999999999)}" if is_valid else "INVALID_PHONE",
                "email": f"{fn.lower()}.{ln.lower()}@{comp.lower().replace(' ', '')}.com",
                "company": comp,
                "raw_row_valid": is_valid,
                "validation_errors": [] if is_valid else ["Invalid phone number format"],
                "createdAt": datetime.utcnow()
            }
            added_docs.append(inv)
            in_memory_db["invitees"].append(inv)

        if db.db is not None:
            try:
                await db.db["invitees"].insert_many(added_docs)
            except Exception as e:
                print("MongoDB insert error:", e)

        return {
            "success": True,
            "generated": len(added_docs),
            "invalidCount": len([d for d in added_docs if not d["raw_row_valid"]])
        }

    added = []
    for item in items:
        phone_str = str(item.get("phone", "")).strip()
        email_str = str(item.get("email", "")).strip()
        
        errors = []
        if not phone_str or len(phone_str) < 8 or phone_str.lower() == "phone":
            errors.append("Invalid phone format (must have standard country code & 10 digits)")
        if not email_str:
            errors.append("Invalid phone or email format")
            
        inv = {
            "_id": f"inv_{uuid4().hex[:8]}",
            "externalId": str(item.get("id", "")),
            "name": item.get("name", "Unknown"),
            "phone": phone_str,
            "email": email_str,
            "company": str(item.get("company", "")),
            "raw_row_valid": len(errors) == 0,
            "validation_errors": errors,
            "createdAt": datetime.utcnow()
        }
        added.append(inv)
        in_memory_db["invitees"].append(inv)
        if db.db is not None:
            try:
                await db.db["invitees"].insert_one(inv)
            except Exception:
                pass

    return {
        "success": True,
        "added": len(added),
        "validCount": len([i for i in added if i["raw_row_valid"]]),
        "invalidCount": len([i for i in added if not i["raw_row_valid"]])
    }


# --- CAMPAIGNS ENDPOINTS ---
@router.get("/campaigns")
async def get_campaigns():
    if db.db is not None:
        try:
            cursor = db.db["campaigns"].find()
            camps = await cursor.to_list(length=100)
            return {"campaigns": camps}
        except Exception:
            pass
    return {"campaigns": in_memory_db["campaigns"]}

@router.post("/campaigns")
async def create_campaign(payload: Dict[str, Any] = Body(...)):
    invitee_ids = payload.get("invitee_ids", [])
    if not invitee_ids:
        return {"error": "No valid invitees selected to snapshot into campaign", "status": 400}

    camp_id = f"camp_{uuid4().hex[:8]}"
    campaign = {
        "_id": camp_id,
        "campaignName": payload.get("campaign_name", "New RSVP Campaign"),
        "eventName": payload.get("event_name", "Annual Event"),
        "eventDate": payload.get("event_date", "2026-10-25"),
        "location": payload.get("event_location", "Ahmedabad"),
        "objective": payload.get("objective", "RSVP Calls"),
        "status": "draft",
        "totalInvitees": len(invitee_ids),
        "invalidRows": 0,
        "createdAt": datetime.utcnow()
    }

    # Fetch these invitees to snapshot their data
    invitee_snapshots = []
    
    if db.db is not None:
        try:
            cursor = db.db["invitees"].find({"_id": {"$in": invitee_ids}})
            db_invitees = await cursor.to_list(length=None)
            for inv in db_invitees:
                ci = {
                    "_id": f"ci_{uuid4().hex[:8]}",
                    "campaignId": camp_id,
                    "inviteeId": inv["_id"],
                    "name": inv["name"],
                    "phone": inv["phone"],
                    "email": inv["email"],
                    "status": "pending",
                    "attemptCount": 0,
                    "maxAttempts": 3,
                    "createdAt": datetime.utcnow()
                }
                invitee_snapshots.append(ci)
                
            if invitee_snapshots:
                await db.db["campaigns"].insert_one(campaign)
                await db.db["campaign_invitees"].insert_many(invitee_snapshots)
                return {"success": True, "campaign": campaign, "invitee_count": len(invitee_snapshots)}
            else:
                return {"error": "No valid invitees found in database to snapshot", "status": 400}
        except Exception as e:
            pass

    # Fallback to memory
    for inv in in_memory_db["invitees"]:
        if inv["_id"] in invitee_ids:
            ci = {
                "_id": f"ci_{uuid4().hex[:8]}",
                "campaignId": camp_id,
                "inviteeId": inv["_id"],
                "name": inv["name"],
                "phone": inv["phone"],
                "email": inv["email"],
                "status": "pending",
                "attemptCount": 0,
                "maxAttempts": 3,
                "createdAt": datetime.utcnow()
            }
            invitee_snapshots.append(ci)
            in_memory_db["campaign_invitees"].append(ci)

    in_memory_db["campaigns"].append(campaign)
    return {"success": True, "campaign": campaign, "invitee_count": len(invitee_snapshots)}


@router.get("/campaigns/{campaign_id}")
async def get_campaign_detail(campaign_id: str):
    if db.db is not None:
        try:
            campaign = await db.db["campaigns"].find_one({"_id": campaign_id})
            if campaign:
                cursor = db.db["campaign_invitees"].find({"campaignId": campaign_id})
                invitees = await cursor.to_list(length=1000)
                return {"success": True, "campaign": campaign, "invitees": invitees}
            else:
                raise HTTPException(status_code=404, detail="Campaign not found")
        except HTTPException:
            raise
        except Exception:
            pass

    # Fallback to memory
    campaign = next((c for c in in_memory_db["campaigns"] if c["_id"] == campaign_id), None)
    if campaign:
        invitees = [ci for ci in in_memory_db["campaign_invitees"] if ci["campaignId"] == campaign_id]
        return {"success": True, "campaign": campaign, "invitees": invitees}
    raise HTTPException(status_code=404, detail="Campaign not found")

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str):
    global in_memory_db
    if db.db is not None:
        try:
            await db.db["campaigns"].delete_one({"_id": campaign_id})
            await db.db["campaign_invitees"].delete_many({"campaignId": campaign_id})
            await db.db["call_results"].delete_many({"campaignId": campaign_id})
            return {"success": True, "message": "Campaign deleted from MongoDB Atlas"}
        except Exception:
            pass

    in_memory_db["campaigns"] = [c for c in in_memory_db["campaigns"] if c["_id"] != campaign_id]
    in_memory_db["campaign_invitees"] = [ci for ci in in_memory_db["campaign_invitees"] if ci["campaignId"] != campaign_id]
    in_memory_db["call_results"] = [cr for cr in in_memory_db["call_results"] if cr["campaignId"] != campaign_id]
    return {"success": True, "message": "Campaign deleted"}


# --- CALL EXECUTION ENDPOINT ---
@router.post("/calling/execute")
async def execute_call(payload: Dict[str, Any] = Body(...)):
    ci_id = payload.get("campaignInviteeId")
    
    ci = None
    if db.db is not None:
        try:
            ci = await db.db["campaign_invitees"].find_one({"_id": ci_id})
        except Exception:
            pass
            
    if not ci:
        ci = next((item for item in in_memory_db["campaign_invitees"] if item["_id"] == ci_id), None)
        
    if not ci:
        raise HTTPException(status_code=404, detail="CampaignInvitee record not found")

    new_attempt = ci.get("attemptCount", 0) + 1
    call_res = await CallingService.simulate_call(
        campaign_id=ci["campaignId"],
        invitee_id=ci["inviteeId"],
        campaign_invitee_id=ci["_id"],
        invitee_name=ci["name"],
        attempt=new_attempt
    )

    # State update map
    new_status = ci.get("status", "pending")
    if call_res["rsvpStatus"]:
        new_status = call_res["rsvpStatus"]
    elif new_attempt >= ci.get("maxAttempts", 3):
        new_status = "failed"

    update_fields = {
        "attemptCount": new_attempt,
        "lastAttemptAt": call_res.get("completedAt", datetime.utcnow().isoformat()),
        "notes": call_res.get("notes", ""),
        "status": new_status
    }
    
    ci.update(update_fields)

    if db.db is not None:
        try:
            # Update Campaign Invitee back to MongoDB
            await db.db["campaign_invitees"].update_one(
                {"_id": ci_id},
                {"$set": update_fields}
            )
            # Log the call result to MongoDB
            call_res["_id"] = f"cr_{uuid4().hex[:8]}"
            await db.db["call_results"].insert_one(call_res)
            return {"success": True, "result": call_res, "invitee": ci}
        except Exception as e:
            print("MongoDB execute call error:", e)

    # Fallback to memory updates
    for item in in_memory_db["campaign_invitees"]:
        if item["_id"] == ci_id:
            item.update(update_fields)
            break

    in_memory_db["call_results"].append(call_res)
    return {"success": True, "result": call_res, "invitee": ci}

from pymongo import UpdateOne

@router.post("/calling/execute-batch")
async def execute_batch_call(payload: Dict[str, Any] = Body(...)):
    campaign_id = payload.get("campaignId")
    if not campaign_id:
        raise HTTPException(status_code=400, detail="Missing campaignId")

    pending_cis = []
    if db.db is not None:
        try:
            cursor = db.db["campaign_invitees"].find({"campaignId": campaign_id, "status": "pending"})
            pending_cis = await cursor.to_list(length=None)
        except Exception:
            pass

    if not pending_cis:
        return {"success": True, "message": "No pending invitees found for this campaign.", "processed_count": 0}

    # Simulate all calls concurrently
    tasks = []
    for ci in pending_cis:
        new_attempt = ci.get("attemptCount", 0) + 1
        tasks.append(CallingService.simulate_call(
            campaign_id=ci["campaignId"],
            invitee_id=ci["inviteeId"],
            campaign_invitee_id=ci["_id"],
            invitee_name=ci["name"],
            attempt=new_attempt
        ))

    call_results = await asyncio.gather(*tasks)

    # Bulk update and insert
    updates = []
    db_results = []
    
    for ci, call_res in zip(pending_cis, call_results):
        new_attempt = ci.get("attemptCount", 0) + 1
        new_status = call_res.get("rsvpStatus") or ("failed" if new_attempt >= ci.get("maxAttempts", 3) else "pending")
        
        call_res["_id"] = f"cr_{uuid4().hex[:8]}"
        db_results.append(call_res)
        
        update_doc = {
            "attemptCount": new_attempt,
            "lastAttemptAt": call_res.get("completedAt", datetime.utcnow().isoformat()),
            "notes": call_res.get("notes", ""),
            "status": new_status
        }
        updates.append(UpdateOne({"_id": ci["_id"]}, {"$set": update_doc}))

    if db.db is not None:
        try:
            if updates:
                await db.db["campaign_invitees"].bulk_write(updates)
            if db_results:
                await db.db["call_results"].insert_many(db_results)
        except Exception as e:
            print("MongoDB batch execute error:", e)

    return {"success": True, "processed_count": len(pending_cis)}

