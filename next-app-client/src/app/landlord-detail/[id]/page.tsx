
export const dynamic = "force-static";
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const res = await fetch(
    "https://api.escuelajs.co/api/v1/products?offset=0&limit=10",
    {
      next: {
        revalidate: 60,
      },
    }
  );
  const products = await res.json();
  if (!products || !Array.isArray(products)) {
    return [];
  }

  return products.slice(0, 3).map((product) => ({
    id: product.id.toString(),
  }));
}


export default async function LandlordRoomPage({ params }: { params: Promise<{ id: number }> }) {
  const id = (await params).id;
  // Fetch landlord data based on the ID
  return (
    <div>Landlord Room Page for ID: {id}</div>
  )
}