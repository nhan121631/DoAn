import MapSection from "@/app/landlord/components/room-detail/map";
import ContactForm from "./ContactForm";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div
      id="contact"
      className="relative flex flex-col items-center w-full py-20 mt-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-4 mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-full">
            <MessageCircle className="w-4 h-4" />
            Liên hệ với chúng tôi
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
            Sẵn sàng hỗ trợ bạn
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Vui lòng để lại
            thông tin, chúng tôi sẽ phản hồi sớm nhất có thể.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16 mb-20">
          {/* Left side - Map */}
          <div className="flex-1">
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
              <div className="relative p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  Địa chỉ của chúng tôi
                </h3>
                <div className="rounded-xl overflow-hidden">
                  <MapSection
                    address="90 Nguyen Thuc Tu, Hoa Hai, Ngu Hanh Son, Da Nang"
                    isNearby={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Contact Form */}
          <div className="flex-1">
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
              <div className="relative p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  Gửi tin nhắn
                </h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phone */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Điện thoại
              </h3>
              <a
                href="tel:+84382972543"
                className="text-slate-600 hover:text-emerald-600 transition-colors duration-200 font-medium"
              >
                +84 382 972 543
              </a>
              <p className="text-sm text-slate-500 mt-1">
                Hỗ trợ khách hàng 24/7
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Email
              </h3>
              <a
                href="mailto:contact@ants123.com"
                className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                contact@ants123.com
              </a>
              <p className="text-sm text-slate-500 mt-1">
                Phản hồi trong vòng 2 giờ
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Địa chỉ
              </h3>
              <p className="text-slate-600 font-medium">90 Nguyễn Thúc Tự</p>
              <p className="text-slate-500 text-sm">Đà Nẵng, Việt Nam</p>
              <p className="text-sm text-slate-500 mt-1">Mở cửa 8:00 - 18:00</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 text-sm text-slate-600 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Đội ngũ hỗ trợ đang trực tuyến
          </div>
        </div>
      </div>
    </div>
  );
}
