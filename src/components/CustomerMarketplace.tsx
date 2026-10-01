import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Store, FoodItem } from '../types';
import {
  Heart,
  Clock,
  Star,
  MapPin,
  Share2,
  QrCode,
  Flame,
  CheckCircle2,
  Plus,
  ChevronRight,
} from 'lucide-react';

interface CustomerMarketplaceProps {
  onSelectItem: (item: FoodItem) => void;
  searchTerm: string;
}

export const CustomerMarketplace: React.FC<CustomerMarketplaceProps> = ({
  onSelectItem,
  searchTerm,
}) => {
  const { stores, foodItems, favoriteStoreIds, toggleFavorite } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [qrModalStore, setQrModalStore] = useState<Store | null>(null);
  const [copiedLinkStoreId, setCopiedLinkStoreId] = useState<string | null>(null);

  const categories = [
    'All',
    'Waakye',
    'Jollof',
    'Banku & Fish',
    'Fried Rice',
    'Street Food & Snacks',
    'Local Ghanaian',
  ];

  const availableStores = stores.filter(
    (s) => s.subscriptionStatus !== 'suspended'
  );

  const displayStores = availableStores.filter((store) => {
    if (activeTab === 'favorites' && !favoriteStoreIds.includes(store.id)) {
      return false;
    }
    if (searchTerm) {
      const matchName = store.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = store.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchAddress = store.address.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchCat || matchAddress;
    }
    return true;
  });

  const displayFoodItems = foodItems.filter((item) => {
    const parentStore = stores.find((s) => s.id === item.storeId);
    if (!parentStore || parentStore.subscriptionStatus === 'suspended') return false;

    if (selectedStoreFilter && item.storeId !== selectedStoreFilter) {
      return false;
    }

    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }

    if (searchTerm) {
      const matchName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStore = parentStore.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchDesc || matchStore;
    }

    return true;
  });

  const handleCopyLink = (store: Store) => {
    const dummyUrl = `https://chowgrid.gh/store/${store.id}`;
    navigator.clipboard.writeText(dummyUrl);
    setCopiedLinkStoreId(store.id);
    setTimeout(() => setCopiedLinkStoreId(null), 2500);
  };

  const selectedStoreObj = stores.find((s) => s.id === selectedStoreFilter);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-10">
      {/* Warm, Natural Hero Banner */}
      {!selectedStoreFilter && !searchTerm && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-5 sm:p-12 shadow-md text-white">
          <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-amber-200" />
              <span>Authentic Ghanaian Dishes & Custom Meals</span>
            </div>
            <h1 className="text-2xl sm:text-5xl font-extrabold tracking-tight leading-tight font-['Outfit']">
              Fresh food from your favorite local kitchens.
            </h1>
            <p className="text-orange-50 text-xs sm:text-base leading-relaxed max-w-xl">
              Build your custom Waakye with your favorite proteins and sides, or order fresh party jollof with verified delivery OTP security.
            </p>
            <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById('dishes-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-sm transition active:scale-95 text-center"
              >
                Explore Menus & Customizer
              </button>
              <div className="flex items-center gap-3 text-xs text-orange-100 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                  <span>Fair Pricing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                  <span>Dual OTP Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Store Active Filter Bar */}
      {selectedStoreObj && (
        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src={selectedStoreObj.logoUrl}
              alt={selectedStoreObj.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Outfit']">{selectedStoreObj.name}</h3>
                <span className="text-[10px] sm:text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md font-medium border border-orange-200">
                  {selectedStoreObj.prepTimeEstimate} prep
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{selectedStoreObj.tagline}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStoreFilter(null)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            All Stores
          </button>
        </div>
      )}

      {/* Tabs & Search Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-3 sm:pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            All Stores ({availableStores.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
            <span>Favorites ({favoriteStoreIds.length})</span>
          </button>
        </div>

        {/* Category Pills with smooth hidden scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-orange-100 text-orange-800 border border-orange-300 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Store Discovery Section */}
      {!selectedStoreFilter && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Verified Food Stores</h2>
            <p className="text-xs text-slate-500">Authentic independent kitchens with direct delivery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayStores.map((store) => {
              const isFav = favoriteStoreIds.includes(store.id);
              const storeDishesCount = foodItems.filter((f) => f.storeId === store.id).length;

              return (
                <div
                  key={store.id}
                  className="group bg-white rounded-3xl border border-slate-200/80 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  {/* Top Cover */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={store.coverUrl}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                    {/* Status & Timing */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${
                          store.isOpen
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {store.isOpen ? 'Open Now' : 'Closed'}
                      </span>
                    </div>

                    {/* Action buttons (Fav, Share, QR) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(store);
                        }}
                        title="Copy Store Link"
                        className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full transition shadow-sm relative"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        {copiedLinkStoreId === store.id && (
                          <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                            Link Copied!
                          </span>
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQrModalStore(store);
                        }}
                        title="Store QR Code"
                        className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full transition shadow-sm"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(store.id);
                        }}
                        className={`p-2 rounded-full transition shadow-sm ${
                          isFav
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/90 hover:bg-white text-slate-600'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Logo */}
                    <div className="absolute -bottom-3 left-4 flex items-end gap-3">
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
                      />
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 pt-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition font-['Outfit']">
                          {store.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                          <span>{store.rating}</span>
                          <span className="text-[10px] text-slate-500">({store.reviewCount})</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{store.tagline}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[170px]">{store.address}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          {store.prepTimeEstimate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium">
                          {store.category}
                        </span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {storeDishesCount} dishes
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedStoreFilter(store.id)}
                      className="w-full mt-3 py-2.5 bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <span>View Menu</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Dishes & Customizer Section */}
      <section id="dishes-section" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
              {selectedStoreFilter ? `Menu from ${selectedStoreObj?.name}` : 'Popular Dishes & Customizable Meals'}
            </h2>
            <p className="text-xs text-slate-500">
              Customize proteins, sides, and extras with direct online ordering
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {displayFoodItems.length} items available
          </span>
        </div>

        {displayFoodItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 text-sm">No food items found matching your filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStoreFilter(null);
              }}
              className="mt-3 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFoodItems.map((dish) => {
              const parentStore = stores.find((s) => s.id === dish.storeId);
              const isCustomizable = dish.type === 'build_your_meal';

              return (
                <div
                  key={dish.id}
                  className="group bg-white rounded-3xl border border-slate-200/80 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  {/* Dish Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Tag badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${
                          isCustomizable
                            ? 'bg-orange-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isCustomizable ? 'Custom Meal' : 'Fixed Combo'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-900 shadow-sm border border-slate-100">
                      {isCustomizable ? `From ₵${dish.basePrice.toFixed(2)}` : `₵${dish.basePrice.toFixed(2)}`}
                    </div>

                    <div className="absolute bottom-2 left-4 text-xs font-medium text-white drop-shadow">
                      by <span className="font-bold text-orange-200">{parentStore?.name}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition font-['Outfit']">
                        {dish.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>

                    {/* Modifier Highlights */}
                    {dish.modifierGroups && dish.modifierGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dish.modifierGroups.map((g) => (
                          <span
                            key={g.id}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            + {g.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => onSelectItem(dish)}
                      className="w-full mt-2 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-sm active:scale-98"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>{isCustomizable ? 'Build / Customize Meal' : 'Select Meal'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* QR Code Modal */}
      {qrModalStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">{qrModalStore.name} QR Code</h3>
            <p className="text-xs text-slate-500">
              Scan this code to instantly open the digital menu on your phone.
            </p>

            <div className="p-6 bg-slate-50 rounded-2xl inline-block border border-slate-200">
              <svg viewBox="0 0 100 100" className="w-40 h-40">
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="15" width="15" height="15" fill="#fff" />
                <rect x="18" y="18" width="9" height="9" fill="#0f172a" />

                <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="70" y="15" width="15" height="15" fill="#fff" />
                <rect x="73" y="18" width="9" height="9" fill="#0f172a" />

                <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="70" width="15" height="15" fill="#fff" />
                <rect x="18" y="73" width="9" height="9" fill="#0f172a" />

                <rect x="42" y="15" width="8" height="8" fill="#0f172a" />
                <rect x="42" y="30" width="8" height="15" fill="#0f172a" />
                <rect x="20" y="42" width="15" height="8" fill="#0f172a" />
                <rect x="45" y="55" width="10" height="10" fill="#0f172a" />
                <rect x="65" y="45" width="25" height="8" fill="#0f172a" />
                <rect x="65" y="65" width="10" height="25" fill="#0f172a" />
                <rect x="80" y="80" width="10" height="10" fill="#0f172a" />
              </svg>
            </div>

            <div className="text-xs text-slate-700 font-mono bg-slate-100 p-2 rounded-xl border border-slate-200">
              chowgrid.gh/store/{qrModalStore.id}
            </div>

            <button
              onClick={() => setQrModalStore(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
            >
              Close QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
