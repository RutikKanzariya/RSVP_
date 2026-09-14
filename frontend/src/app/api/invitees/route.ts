import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Invitee } from '@/types';

// GET /api/invitees - Return master invitee list
// POST /api/invitees - Upload parsed CSV items or bulk generate synthetic invitees for scale testing (100 - 10,000+)
export async function GET() {
  return NextResponse.json({
    invitees: db.invitees,
    summary: {
      total: db.invitees.length,
      valid: db.invitees.filter(i => i.raw_row_valid).length,
      invalid: db.invitees.filter(i => !i.raw_row_valid).length
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mode A: Upload list of parsed CSV invitees
    if (body.items && Array.isArray(body.items)) {
      const newItems: Invitee[] = body.items.map((item: any, idx: number) => {
        const errors: string[] = [];

        if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
          errors.push('Missing or empty name');
        }

        const phoneStr = item.phone ? String(item.phone).trim() : '';
        if (!phoneStr || phoneStr.length < 8) {
          errors.push('Invalid phone format (must have standard country code & 10 digits)');
        }

        const emailStr = item.email ? String(item.email).trim() : '';
        if (!emailStr || !emailStr.includes('@')) {
          errors.push('Invalid email address format');
        }

        return {
          id: item.id || `inv_${Date.now()}_${idx}`,
          name: item.name || 'Unknown Invitee',
          phone: phoneStr,
          email: emailStr,
          company: item.company || 'Enterprise Guest',
          raw_row_valid: errors.length === 0,
          validation_errors: errors
        };
      });

      db.invitees.unshift(...newItems);

      return NextResponse.json({
        success: true,
        added: newItems.length,
        validCount: newItems.filter(i => i.raw_row_valid).length,
        invalidCount: newItems.filter(i => !i.raw_row_valid).length
      });
    }

    // Mode B: Generate Large Scale Synthetic Dataset (e.g. 500, 1000, 5000) for testing 100k scale architecture
    if (body.generate_count) {
      const count = Math.min(Number(body.generate_count) || 100, 10000);
      const generated: Invitee[] = [];
      const firstNames = ['Aarav', 'Diya', 'Rohan', 'Ananya', 'Karan', 'Aditi', 'Vihaan', 'Isha', 'Kabir', 'Sanya', 'Arjun', 'Meera'];
      const lastNames = ['Sharma', 'Patel', 'Shah', 'Verma', 'Mehta', 'Joshi', 'Kapoor', 'Gupta', 'Singhania', 'Chopra'];
      const companies = ['TechCorp', 'GlobalVox', 'Innovate AI', 'Apex Ventures', 'FinTech Global', 'CloudScale Inc', 'Vanguard Systems'];

      for (let i = 0; i < count; i++) {
        const fname = firstNames[i % firstNames.length];
        const lname = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        const fullName = `${fname} ${lname} ${i + 1}`;
        const isValid = i % 25 !== 0; // 4% corrupted/invalid rows for validation UI test
        
        generated.push({
          id: `gen_${Date.now()}_${i + 1}`,
          name: fullName,
          phone: isValid ? `+9198${Math.floor(10000000 + Math.random() * 90000000)}` : 'INVALID_PHONE',
          email: isValid ? `${fname.toLowerCase()}.${lname.toLowerCase()}${i}@domain.com` : 'bad_email.com',
          company: companies[i % companies.length],
          raw_row_valid: isValid,
          validation_errors: isValid ? [] : ['Malformed phone or invalid email string']
        });
      }

      db.invitees = generated;

      return NextResponse.json({
        success: true,
        generated: count,
        validCount: generated.filter(i => i.raw_row_valid).length,
        invalidCount: generated.filter(i => !i.raw_row_valid).length
      });
    }

    return NextResponse.json({ error: 'Invalid payload. Provide items array or generate_count.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process invitees' }, { status: 500 });
  }
}
