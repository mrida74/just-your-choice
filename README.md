# Just Your Choice - Women's E-commerce (Next.js App Router)

Production-oriented e-commerce starter with strict category separation across UI and backend.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- MongoDB + Mongoose

## Strict Product Categories

- `saree`
- `clothing`
- `bags`
- `cosmetics`
- `skincare`

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env.local`:

```bash
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=just-your-choice
```

3. Start dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Routes

- `/` - Homepage with 5 dedicated horizontal product sections
- `/category/saree`
- `/category/clothing`
- `/category/bags`
- `/category/cosmetics`
- `/category/skincare`
- `/cart`
- `/admin`

## API

### Get products

`GET /api/products`

Optional query params:

- `category` (`saree|clothing|bags|cosmetics|skincare`)
- `search` (text search)
- `minPrice` (number)
- `maxPrice` (number)

Examples:

- `GET /api/products?category=saree`
- `GET /api/products?category=cosmetics&minPrice=10&maxPrice=40`

### Create product

`POST /api/products`

Required payload fields:

- `title`
- `description`
- `price`
- `category` (enum)
- `images` (array or comma-separated string)
- `stock`

### Update/Delete product

- `PUT /api/products/:id`
- `DELETE /api/products/:id`

## Notes

- Category filtering is enforced in both schema and API validation.
- Admin form requires category selection from controlled options.
- If MongoDB is unavailable, product listing falls back to mock catalog data for local UI development.
