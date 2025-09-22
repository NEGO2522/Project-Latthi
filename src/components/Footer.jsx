import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebook />, href: 'https://www.facebook.com/share/1BTHw6tsV4/' },
    { icon: <FaInstagram />, href: 'https://www.instagram.com/lathishop_?igsh=NDIxd252b2lvdzJv' },
  ];

  const footerLinks = {
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Feedback', href: '/feedback' },
      { name: 'Shipping', href: '/shipping' },
      { name: 'Cancellation & Refund', href: '/cancellation_refund' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy_policy' },
      { name: 'Terms & Conditions', href: '/terms_conditions' },
    ],
    quickLinks: [
        { name: 'All Items', href: '/items' },
        { name: 'My Orders', href: '/orders' },
        { name: 'My Cart', href: '/cart' },
    ]
  };

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src="/assets/Logo.png" alt="Lathi Logo" className="h-10 w-10 object-contain"/>
              <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Great Vibes', cursive" }}>LATHI</h1>
            </Link>
            <p className="text-gray-500 text-sm">
              Elegance in every thread. Discover our exclusive collection of finely crafted kurtis.
            </p>
          </div>

          <div className="col-span-1 md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map(link => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map(link => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map(link => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">
            &copy; {new Date().getFullYear()} Lathi. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-4">
            {socialLinks.map((link, index) => (
              <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <span className="sr-only">{link.icon.type.displayName}</span>
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
