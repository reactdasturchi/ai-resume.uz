/** Bepul reja chegaralari */
export const FREE_MAX_TOKENS = 10
export const FREE_MAX_RESUMES = 4

export type Plan = {
  id: string
  name: string
  price: number
  priceLabel: string
  tokens: number
  resumes: number
  features: string[]
  highlighted?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Bepul',
    price: 0,
    priceLabel: '0 soʻm',
    tokens: 10,
    resumes: 4,
    features: ['10 token', '4 ta rezyume', 'AI yordami', 'PDF eksport'],
    highlighted: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 49000,
    priceLabel: '49 000 soʻm/oy',
    tokens: 30,
    resumes: 15,
    features: [
      '30 token',
      '15 ta rezyume',
      'AI yordami',
      'PDF eksport',
      'Email qoʻllab-quvvatlash',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99000,
    priceLabel: '99 000 soʻm/oy',
    tokens: 100,
    resumes: 50,
    features: [
      '100 token',
      '50 ta rezyume',
      'Prioritetli qoʻllab-quvvatlash',
      'Cheksiz yaxshilash',
    ],
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Biznes',
    price: 199000,
    priceLabel: '199 000 soʻm/oy',
    tokens: 500,
    resumes: 200,
    features: ['500 token', '200 ta rezyume', 'Jamoaviy rezyumelar', 'API kirish'],
    highlighted: false,
  },
]
