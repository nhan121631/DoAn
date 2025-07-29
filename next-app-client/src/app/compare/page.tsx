import HeaderDetail from "../detail/Header-detail";
import ListingComparisonDisplay from "../users/components/compare/ListingComparisonDisplay";
import Footer from "../users/components/Footer";



const sampleListing1 = {
  id: 'listing123',
  title: 'Cozy Studio',
  price: 3800000,
  area: 20,
  address: '171/14/18 Duong Nguyen Tu Gian, Ward 12, Go Vap District, Ho Chi Minh City',
  description: 'Brand new, clean room with full furniture, balcony, and window. Great location near Emart, market, all amenities, wide alley for trucks, absolutely secure area.',
  electricityRate: 3800,
  waterRate: 100000,
  images: [
    { id: 1, url: "/images/anh1.jpg" },
    { id: 2, url: "/images/anh2.jpg" },
    { id: 3, url: "/images/anh3.jpg" },
    
  ],
  amenities: [ // Added amenities for listing 1
    { label: "Fully furnished", enabled: true },
    { label: "Washing machine", enabled: true },
    { label: "Flexible hours", enabled: true },
    { label: "Mezzanine", enabled: true },
    { label: "Refrigerator", enabled: true },
    { label: "Kitchen shelf", enabled: true },
    { label: "Air conditioner", enabled: false },
    { label: "No landlord living on site", enabled: true },
    { label: "Elevator", enabled: false },
    { label: "24/7 security", enabled: false },
    { label: "Underground parking", enabled: false },
  ],
};

const sampleListing2 = {
  id: 'listing456',
  title: 'Luxury Apartment',
  price: 5500000,
  area: 35,
  address: '100 Nguyen Thi Thap, Tan Phu Ward, District 7, Ho Chi Minh City',
  description: 'Spacious apartment with 1 bedroom, 1 bathroom, fully furnished. Near Crescent Mall, RMIT University. Ideal for singles or couples.',
  electricityRate: 4000,
  waterRate: 80000,
  images: [
    { id: 1, url: "/images/anh4.jpg" },
    { id: 2, url: "/images/anh5.jpg" },
  ],
  amenities: [ // Added amenities for listing 2
    { label: "Fully furnished", enabled: true },
    { label: "Washing machine", enabled: false },
    { label: "Flexible hours", enabled: true },
    { label: "Mezzanine", enabled: false },
    { label: "Refrigerator", enabled: true },
    { label: "Kitchen shelf", enabled: true },
    { label: "Air conditioner", enabled: true },
    { label: "No landlord living on site", enabled: true },
    { label: "Elevator", enabled: true },
    { label: "24/7 security", enabled: true },
    { label: "Underground parking", enabled: true },
  ],
};




export default function ComparePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header for the comparison page */}
      <HeaderDetail />

  
      <main className="flex-grow pt-[80px] p-4 bg-gray-50"> {/* Adjust pt-[80px] to match header height */}
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">Listing Comparison</h1>
        
        <ListingComparisonDisplay 
          listing1={sampleListing1} 
          listing2={sampleListing2} 
        />
        
        
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
