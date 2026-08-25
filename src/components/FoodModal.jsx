import React from 'react';
import useGameStore from '../store/useGameStore';
import { Apple, Salad, Pizza, Coffee } from 'lucide-react';
import audioSystem from '../utils/audioSystem';

export default function FoodModal() {
  const isOpen = useGameStore(state => state.isFoodMenuOpen);
  const closeFoodMenu = useGameStore(state => state.closeFoodMenu);
  const eatFood = useGameStore(state => state.eatFood);

  if (!isOpen) return null;

  const foods = [
    { id: 'apple', name: 'Táo', energy: 10, stress: -5, icon: Apple, color: 'text-red-500', desc: 'Tốt cho sức khỏe', animData: { color: '#ef4444', label: 'Táo' } },
    { id: 'salad', name: 'Salad Rau', energy: 15, stress: -10, icon: Salad, color: 'text-green-500', desc: 'Thanh lọc cơ thể', animData: { color: '#22c55e', label: 'Salad' } },
    { id: 'burger', name: 'Hamburger', energy: 20, stress: 5, icon: Pizza, color: 'text-orange-500', desc: 'Ngon nhưng dễ tăng cân', animData: { color: '#f59e0b', label: 'Burger' } },
    { id: 'energy_drink', name: 'Nước tăng lực', energy: 30, stress: 15, icon: Coffee, color: 'text-blue-500', desc: 'Bơm năng lượng ảo, rất dễ stress', animData: { color: '#3b82f6', label: 'Nước lốc' } }
  ];

  const handleSelect = (food) => {
    audioSystem.playClick();
    // Kích hoạt animation nhân vật đang ăn món này
    if (window.triggerPlayerAnimation) {
      window.triggerPlayerAnimation('eat', 3000, food);
    }
    eatFood(food);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { audioSystem.playClick(); closeFoodMenu(); }}></div>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative z-10 border-4 border-slate-200">
        <h2 className="text-2xl font-bold mb-4 text-center text-slate-800">Tủ lạnh có gì?</h2>

        <div className="grid grid-cols-1 gap-3">
          {foods.map(food => (
            <button
              key={food.id}
              onClick={() => handleSelect(food)}
              className="flex items-center p-3 rounded-lg border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className={`p-3 rounded-full bg-slate-100 group-hover:bg-white mr-4 ${food.color}`}>
                <food.icon size={24} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-slate-700">{food.name}</h3>
                <p className="text-xs text-slate-500">{food.desc}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-600">+{food.energy} Năng lượng</div>
                {food.stress > 0 ? (
                  <div className="text-sm font-bold text-red-500">+{food.stress} Stress</div>
                ) : (
                  <div className="text-sm font-bold text-blue-500">{food.stress} Stress</div>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => { audioSystem.playClick(); closeFoodMenu(); }}
          className="mt-6 w-full py-2 bg-slate-200 hover:bg-slate-300 rounded font-bold text-slate-700 transition-colors"
        >
          Đóng tủ lạnh
        </button>
      </div>
    </div>
  );
}
