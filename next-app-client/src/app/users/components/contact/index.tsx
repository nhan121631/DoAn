import MapSection from "@/app/landlord/components/room-detail/map";

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center w-full py-16 mt-10 bg-white">
      <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
        Contact Us
      </h1>
      <span className="justify-center mt-3 mb-8 text-center text-gray-600">
        We’re glad to help! Just leave us your information and we’ll respond to
        your request as quickly as possible.
      </span>

      <div className="flex flex-col w-full max-w-6xl gap-8 px-4 mx-auto lg:flex-row">
        {/* Left side - Map */}
        <div className="flex-1">
          <MapSection address="90 Nguyen Thuc Tu, Hoa Hai, Ngu Hanh Son, Da Nang" />
        </div>

        {/* Right side - Contact Form */}
        <div className="flex-1">
          <div className="p-10 bg-white rounded-lg shadow-lg">
            <form className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <textarea
                  rows={6}
                  placeholder="Message"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 font-medium text-white transition duration-200 bg-red-500 rounded-lg hover:bg-red-600"
              >
                Send now
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="flex flex-col max-w-4xl gap-10 px-4 mx-auto mt-16 md:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Call</h3>
            <p className="text-gray-600">+84 382 972 543</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Email</h3>
            <p className="text-gray-600">contact@ants123.com</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Location</h3>
            <p className="text-gray-600">
              90 Nguyen Thuc Tu Street, Da Nang, Vietnam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
