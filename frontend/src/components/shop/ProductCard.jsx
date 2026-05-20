import { Link } from 'react-router-dom';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const FALLBACK_IMAGE = 'https://placehold.co/1200x1200?text=Image+Unavailable';

const buildImageUrl = (url) => {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const baseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  if (!baseUrl) {
    return url;
  }

  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

const ProductCard = ({ product }) => {
  const productId = product?.id || product?._id;
  const images = Array.isArray(product?.imageUrls)
    ? product.imageUrls.map(buildImageUrl).filter(Boolean)
    : (Array.isArray(product?.images) ? product.images.map(buildImageUrl).filter(Boolean) : []);
  const thumbnail = buildImageUrl(product?.thumbnail);
  const galleryImages = images.length > 0 ? images : (thumbnail ? [thumbnail] : []);
  const hasMultipleImages = images.length > 1;
  const price = Number(product?.price) || 0;
  const discountPrice = Number.isFinite(product?.discountPrice) ? product.discountPrice : null;
  const hasDiscount = Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < price;
  const displayImage = galleryImages[0] || FALLBACK_IMAGE;

  return (
    <Link
      to={`/products/${productId}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {galleryImages.length > 0 ? (
          hasMultipleImages ? (
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              pagination={{ clickable: true }}
              loop
              slidesPerView={1}
              className="h-full w-full"
            >
              {galleryImages.map((image, index) => (
                <SwiperSlide key={`${productId ?? 'product'}-${index}`} className="h-full w-full">
                  <img
                    src={image}
                    alt={product?.name || 'Product image'}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <img
              src={displayImage}
              alt={product?.name || 'Product image'}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
        )}
        {hasDiscount && (
          <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
            Sale
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {product?.category?.name || 'Category'}
        </p>
        <h4 className="text-lg font-semibold text-slate-900 line-clamp-2">{product?.name || 'Unnamed product'}</h4>
        <p className="text-sm text-slate-500 line-clamp-2">{product?.description || 'No description available.'}</p>
        <div className="mt-auto flex items-center gap-3">
          <span className="text-lg font-semibold text-slate-900">{formatCurrency(hasDiscount ? discountPrice : price)}</span>
          {hasDiscount && <span className="text-sm text-slate-400 line-through">{formatCurrency(price)}</span>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
