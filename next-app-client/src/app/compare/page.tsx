import HeaderDetail from '../detail/Header-detail';
import Footer from '../users/components/Footer';

export default function ComparePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header for the comparison page */}
      <HeaderDetail />

      {/* Main content area for comparison */}
      {/* Add padding-top to account for the fixed header height */}
      <main className="flex-grow pt-[80px] p-4 bg-gray-50"> {/* Adjust pt-[80px] to match header height */}
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">Listing Comparison</h1>
        
        {/* Placeholder for the actual comparison display component */}
        <div className="bg-white p-6 rounded-xl shadow-md min-h-[500px] flex items-center justify-center text-gray-500">
          {/* This is where your ListingComparisonDisplay component will go */}
          <p>Comparison content will be displayed here.</p>
        </div>
      </main>

      {/* You might want a footer here later */}
      <Footer />
    </div>
  );
}
