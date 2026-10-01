import React, { useState, useEffect } from 'react';
import { FoodItem, ModifierOption, SelectedModifier } from '../types';
import { X, Plus, Minus, Check, AlertCircle, ShoppingBag } from 'lucide-react';

interface MealCustomizerModalProps {
  item: FoodItem | null;
  onClose: () => void;
  onAddToCart: (
    item: FoodItem,
    selectedModifiers: SelectedModifier[],
    quantity: number,
    specialInstructions?: string
  ) => void;
}

export const MealCustomizerModal: React.FC<MealCustomizerModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Record<string, number>>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!item.modifierGroups) return;
    const initial: Record<string, Record<string, number>> = {};

    item.modifierGroups.forEach((group) => {
      initial[group.id] = {};
      group.options.forEach((opt) => {
        if (opt.isDefault) {
          initial[group.id][opt.id] = 1;
        }
      });
    });

    setSelectedOptions(initial);
    setQuantity(1);
    setSpecialInstructions('');
    setValidationError(null);
  }, [item]);

  const handleOptionToggle = (groupId: string, option: ModifierOption, isRadio: boolean) => {
    const group = item.modifierGroups?.find((g) => g.id === groupId);
    if (!group) return;

    setSelectedOptions((prev) => {
      const currentGroupSelections = { ...(prev[groupId] || {}) };

      if (isRadio) {
        return {
          ...prev,
          [groupId]: { [option.id]: 1 },
        };
      } else {
        if (currentGroupSelections[option.id]) {
          delete currentGroupSelections[option.id];
        } else {
          const currentCount = Object.values(currentGroupSelections).reduce((a, b) => a + b, 0);
          if (currentCount >= group.maxSelection) {
            return prev;
          }
          currentGroupSelections[option.id] = 1;
        }
        return {
          ...prev,
          [groupId]: currentGroupSelections,
        };
      }
    });
  };

  const handleOptionQuantityChange = (groupId: string, optionId: string, delta: number) => {
    const group = item.modifierGroups?.find((g) => g.id === groupId);
    if (!group) return;

    setSelectedOptions((prev) => {
      const currentGroupSelections = { ...(prev[groupId] || {}) };
      const currentQty = currentGroupSelections[optionId] || 0;
      const newQty = Math.max(0, currentQty + delta);

      const totalGroupQty = Object.entries(currentGroupSelections).reduce(
        (sum, [optId, qty]) => sum + (optId === optionId ? 0 : qty),
        0
      ) + newQty;

      if (delta > 0 && totalGroupQty > group.maxSelection) {
        return prev;
      }

      if (newQty === 0) {
        delete currentGroupSelections[optionId];
      } else {
        currentGroupSelections[optionId] = newQty;
      }

      return {
        ...prev,
        [groupId]: currentGroupSelections,
      };
    });
  };

  let modifiersUnitCost = 0;
  const flatSelectedModifiers: SelectedModifier[] = [];

  if (item.modifierGroups) {
    item.modifierGroups.forEach((group) => {
      const groupSelections = selectedOptions[group.id] || {};
      Object.entries(groupSelections).forEach(([optId, qty]) => {
        const opt = group.options.find((o) => o.id === optId);
        if (opt && qty > 0) {
          modifiersUnitCost += opt.price * qty;
          flatSelectedModifiers.push({
            groupId: group.id,
            groupName: group.name,
            optionId: opt.id,
            optionName: opt.name,
            unitPrice: opt.price,
            quantity: qty,
          });
        }
      });
    });
  }

  const calculatedUnitPrice = item.basePrice + modifiersUnitCost;
  const grandTotal = calculatedUnitPrice * quantity;

  const handleSubmit = () => {
    if (item.modifierGroups) {
      for (const group of item.modifierGroups) {
        const groupSelections = selectedOptions[group.id] || {};
        const count = Object.values(groupSelections).reduce((a, b) => a + b, 0);

        if (group.required && count < group.minSelection) {
          setValidationError(`Please select at least ${group.minSelection} item in "${group.name}".`);
          return;
        }
      }
    }

    onAddToCart(item, flatSelectedModifiers, quantity, specialInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header Image */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full transition shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                item.type === 'build_your_meal'
                  ? 'bg-orange-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {item.type === 'build_your_meal' ? 'Custom Meal' : 'Fixed Meal'}
              </span>
              <span className="text-xs bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md">
                ~{item.prepTimeMinutes} mins prep
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Outfit']">{item.name}</h2>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 text-sm font-medium">Base Price</span>
            <span className="text-lg font-bold text-slate-900 font-mono">₵{item.basePrice.toFixed(2)}</span>
          </div>

          {/* Validation Banner */}
          {validationError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Modifier Groups */}
          {item.modifierGroups && item.modifierGroups.length > 0 && (
            <div className="space-y-6">
              {item.modifierGroups.map((group) => {
                const groupSelections = selectedOptions[group.id] || {};
                const selectedCount = Object.values(groupSelections).reduce((a, b) => a + b, 0);
                const isSingleChoice = group.maxSelection === 1 && group.minSelection === 1;

                return (
                  <div
                    key={group.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div>
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          {group.name}
                          {group.required && (
                            <span className="text-[10px] uppercase font-bold bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {group.required
                            ? `Select ${group.minSelection === group.maxSelection ? group.minSelection : `${group.minSelection} to ${group.maxSelection}`}`
                            : `Optional (up to ${group.maxSelection})`}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700">
                        {selectedCount} / {group.maxSelection}
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {group.options.map((option) => {
                        const qty = groupSelections[option.id] || 0;
                        const isSelected = qty > 0;

                        return (
                          <div
                            key={option.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-orange-50/80 border-orange-300 text-orange-950'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div
                              onClick={() => {
                                if (!group.allowQuantityMultiplier) {
                                  handleOptionToggle(group.id, option, isSingleChoice);
                                }
                              }}
                              className={`flex items-center gap-3 flex-1 ${!group.allowQuantityMultiplier ? 'cursor-pointer' : ''}`}
                            >
                              <div
                                className={`w-5 h-5 rounded-${isSingleChoice ? 'full' : 'md'} border flex items-center justify-center transition ${
                                  isSelected
                                    ? 'bg-orange-600 border-orange-600 text-white font-bold'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div>
                                <span className="text-sm font-medium">{option.name}</span>
                                <div className="text-xs font-semibold text-orange-700 font-mono">
                                  {option.price > 0 ? `+₵${option.price.toFixed(2)}` : 'Included'}
                                </div>
                              </div>
                            </div>

                            {/* Multiplier counter */}
                            {group.allowQuantityMultiplier ? (
                              <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleOptionQuantityChange(group.id, option.id, -1)}
                                  disabled={qty === 0}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold w-4 text-center text-slate-900">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleOptionQuantityChange(group.id, option.id, 1)}
                                  disabled={selectedCount >= group.maxSelection}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:text-orange-600 disabled:opacity-30"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Special Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra shito, separate stew in small container, mild pepper..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs font-semibold uppercase text-slate-600">Quantity:</span>
            <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-auto flex-1 max-w-sm flex items-center justify-between px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-sm transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart</span>
            </div>
            <span className="text-base font-extrabold bg-black/10 px-2.5 py-0.5 rounded-xl font-mono">
              ₵{grandTotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
