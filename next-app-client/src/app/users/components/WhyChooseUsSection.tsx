import Image from "next/image";

export default function WhyChooseUsSection() {
  const features = [
    {
      icon: "/Icon.svg",
      title: "Tìm phòng dễ dàng",
      description:
        "Chúng tôi giúp bạn tìm phòng bằng cách cung cấp trải nghiệm bất động sản thông minh",
    },
    {
      icon: "/Agent.svg",
      title: "Đại lý giàu kinh nghiệm",
      description:
        "Tìm một đại lý giàu kinh nghiệm, người hiểu rõ thị trường của bạn nhất",
    },
    {
      icon: "/Rentroom.svg",
      title: "Thuê phòng",
      description: "Hàng triệu phòng ở các thành phố yêu thích của bạn",
    },
    {
      icon: "/Ownroom.svg",
      title: "Đăng phòng của bạn",
      description: "Đăng ký ngay để bán hoặc cho thuê phòng của bạn",
    },
  ];

  return (
    <section
      id="why-choose-us"
      className="relative py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
            ✨ Tại sao chọn chúng tôi
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Phòng hoàn hảo của bạn,
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              {" "}
              Đơn giản hóa
            </span>
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Chúng tôi cung cấp danh sách đã được xác minh, chủ nhà đáng tin cậy
            và trải nghiệm thuê phòng liền mạch. Tìm phòng hoàn hảo của bạn với
            các bộ lọc tìm kiếm nâng cao, tour ảo và hỗ trợ khách hàng 24/7.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-500 hover:border-blue-200"
            >
              {/* Icon container */}
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Image
                    src={feature.icon}
                    width={32}
                    height={32}
                    alt={feature.title}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Decorative ring */}
                <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl border-2 border-blue-200/0 group-hover:border-blue-200/50 transition-all duration-500 scale-125"></div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover effect gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-500"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white/50 px-6 py-3 rounded-full border border-gray-200">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            An toàn, nhanh chóng và đáng tin cậy - ngôi nhà của bạn chỉ cách một
            cú nhấp chuột
          </div>
        </div>
      </div>
    </section>
  );
}
