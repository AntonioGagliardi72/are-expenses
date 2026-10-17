export const CATEGORIES = [
  { id: 'flight', label: 'Air travel' },
  { id: 'taxi', label: 'Taxi' },
  { id: 'car_rental', label: 'Car rental' },
  { id: 'toll', label: 'Toll fee (car rental)' },
  { id: 'parking', label: 'Parking' },
  { id: 'fuel', label: 'Fuel' },
  { id: 'train', label: 'Train' },
  { id: 'meals', label: 'Meals' },
  { id: 'hotel', label: 'Hotel' },
  { id: 'other', label: 'Other' }
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]))

// Currencies offered in the form and recognised by the receipt scanner.
// To add one, append its 3-letter ISO code here (and in api/scan-receipt.js).
export const CURRENCIES = [
  'EUR', 'USD', 'AED', 'GBP', 'CHF', 'SAR', 'QAR',
  'KWD', 'OMR', 'BHD', 'KZT', 'TRY', 'EGP', 'INR'
]

// The final report/reimbursement currency for foreign companies
export const REPORT_CURRENCY = 'EUR'

// Extracted from the Business License - Sharjah Publishing City Free Zone
export const COMPANY = {
  name: 'ARE FZE',
  fullName: 'ARE FZE (Advanced Rotating Equipment)',
  licenseNo: '4308540.01',
  formationNumber: '4308540',
  address: 'Business Centre, Sharjah Publishing City Free Zone, Sharjah, United Arab Emirates',
  manager: 'Antonio Gagliardi'
}

export const PREPARER = {
  name: 'Antonio Gagliardi',
  email: 'antonio.gagliardi@are-consulting.com'
}
