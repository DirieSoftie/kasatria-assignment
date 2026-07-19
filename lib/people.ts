import "server-only";
import { parse } from "csv-parse/sync";

export type Person = {
  name: string;
  photo: string;
  age: number;
  country: string;
  interest: string;
  netWorth: number;
};

export async function getPeople(): Promise<Person[]> {
  const url = process.env.GOOGLE_SHEET_CSV_URL;
  if (!url) {
    throw new Error("GOOGLE_SHEET_CSV_URL is not set");
  }

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet (${res.status})`);
  }

  const text = await res.text();
  const rows = parse(text, {
    columns: (header: string[]) => header.map((h) => h.trim()),
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return rows.map((row) => ({
    name: row["Name"],
    photo: row["Photo"],
    age: Number(row["Age"]),
    country: row["Country"],
    interest: row["Interest"],
    netWorth: Number(row["Net Worth"].replace(/[$,]/g, "")),
  }));
}
