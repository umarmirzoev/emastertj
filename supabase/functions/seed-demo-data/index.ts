import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tajik male first names
const firstNames = [
  "Фирдавс","Рустам","Далер","Сомон","Бахром","Фаррух","Абдулло","Шамсиддин","Джамшед","Сироджиддин",
  "Мирзо","Хусейн","Нуриддин","Камол","Зафар","Ашраф","Искандар","Тимур","Файзулло","Алишер",
  "Бобур","Довуд","Иброхим","Камолиддин","Лутфулло","Мансур","Насрулло","Олим","Парвиз","Рахматулло",
  "Саид","Толиб","Умед","Фируз","Хуршед","Шариф","Юсуф","Акбар","Бахтиёр","Гуломиддин",
  "Дилшод","Эмомали","Фаридун","Гайрат","Хомид","Илхом","Джовид","Комил","Латиф","Мухаммад",
];

const lastNames = [
  "Рахимов","Каримов","Шарипов","Назаров","Ибрагимов","Холов","Давлатов","Ашуров","Мирзоев","Сафаров",
  "Бобоев","Гуломов","Додоев","Ёров","Зайниддинов","Исломов","Кодиров","Латипов","Маджидов","Неъматов",
  "Олимов","Партоев","Раджабов","Саидов","Тоджиддинов","Усмонов","Файзуллоев","Хакимов","Шодиев","Юсупов",
  "Абдуллоев","Бозоров","Валиев","Гафуров","Дустов","Эргашев","Зиёев","Исмоилов","Курбонов","Лоиков",
  "Мамадов","Набиев","Остонов","Пирматов","Рузиев","Сатторов","Турсунов","Улугов","Фозилов","Хушвахтов",
];

const bios = [
  "Профессиональный мастер с многолетним опытом работы в Душанбе.",
  "Выполняю работы качественно и в срок. Гарантия на все виды работ.",
  "Опытный специалист. Работаю аккуратно, использую качественные материалы.",
  "Надёжный мастер. Быстрый выезд по всему Душанбе.",
  "Специализируюсь на сложных задачах. Индивидуальный подход к каждому клиенту.",
  "Работаю без выходных. Доступные цены, высокое качество.",
  "Мастер на все руки. Большой опыт в ремонте и обслуживании.",
  "Гарантирую качество. Консультация бесплатно.",
  "Профессионал своего дела. Отзывчивый и пунктуальный.",
  "Быстро, качественно, недорого. Звоните в любое время.",
];

const districts = ["Сино", "Фирдавси", "Шохмансур", "Исмоили Сомони", "Пригород"];

// Dushanbe center coordinates with variation
const dushanbeLat = 38.5598;
const dushanbeLng = 68.7738;

const reviewComments = [
  "Отличный мастер! Всё сделал быстро и качественно.",
  "Рекомендую! Очень аккуратная работа.",
  "Приехал вовремя, сделал всё как надо.",
  "Хороший специалист, приятный в общении.",
  "Работа выполнена на высшем уровне!",
  "Спасибо за оперативность и качество!",
  "Мастер знает своё дело. Буду обращаться ещё.",
  "Всё супер! Цена соответствует качеству.",
  "Профессионал! Решил проблему за час.",
  "Очень доволен результатом. Спасибо!",
  "Сделал даже лучше, чем ожидал.",
  "Пунктуальный и ответственный мастер.",
  "Качественные материалы, аккуратная работа.",
  "Быстро нашёл причину поломки и устранил.",
  "Отличная работа по разумной цене.",
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, dec = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
}
function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Add 2 more categories
    const newCategories = [
      { name_ru: "Кондиционеры", name_tj: "Кондитсионерҳо", name_en: "Air Conditioning", icon: "Wind", color: "from-cyan-400 to-blue-500", sort_order: 14 },
      { name_ru: "Отопление", name_tj: "Гармкунӣ", name_en: "Heating", icon: "Flame", color: "from-orange-400 to-red-500", sort_order: 15 },
    ];
    
    for (const cat of newCategories) {
      const { data: existing } = await supabase.from("service_categories").select("id").eq("name_ru", cat.name_ru).maybeSingle();
      if (!existing) {
        await supabase.from("service_categories").insert(cat);
      }
    }

    // Get all categories
    const { data: allCats } = await supabase.from("service_categories").select("id, name_ru").order("sort_order");
    if (!allCats) throw new Error("No categories");

    // 2. Ensure at least 8 services per category
    const additionalServices: Record<string, { name_ru: string; name_tj: string; name_en: string; price_min: number; price_max: number; unit: string }[]> = {
      "Кондиционеры": [
        { name_ru: "Установка кондиционера", name_tj: "Насб кардани кондитсионер", name_en: "AC Installation", price_min: 300, price_max: 800, unit: "шт" },
        { name_ru: "Чистка кондиционера", name_tj: "Тоза кардани кондитсионер", name_en: "AC Cleaning", price_min: 100, price_max: 250, unit: "шт" },
        { name_ru: "Заправка фреоном", name_tj: "Пур кардани фреон", name_en: "Freon Refill", price_min: 150, price_max: 400, unit: "шт" },
        { name_ru: "Ремонт кондиционера", name_tj: "Таъмири кондитсионер", name_en: "AC Repair", price_min: 200, price_max: 600, unit: "шт" },
        { name_ru: "Демонтаж кондиционера", name_tj: "Бардоштани кондитсионер", name_en: "AC Removal", price_min: 150, price_max: 350, unit: "шт" },
        { name_ru: "Диагностика кондиционера", name_tj: "Диагностикаи кондитсионер", name_en: "AC Diagnostics", price_min: 50, price_max: 150, unit: "шт" },
        { name_ru: "Замена компрессора", name_tj: "Иваз кардани компрессор", name_en: "Compressor Replacement", price_min: 500, price_max: 1500, unit: "шт" },
        { name_ru: "Обслуживание сплит-системы", name_tj: "Хизматрасонии сплит-система", name_en: "Split System Service", price_min: 200, price_max: 500, unit: "шт" },
      ],
      "Отопление": [
        { name_ru: "Установка радиатора", name_tj: "Насб кардани радиатор", name_en: "Radiator Installation", price_min: 200, price_max: 600, unit: "шт" },
        { name_ru: "Промывка системы отопления", name_tj: "Шустани системаи гармкунӣ", name_en: "Heating System Flush", price_min: 300, price_max: 800, unit: "шт" },
        { name_ru: "Установка котла", name_tj: "Насб кардани дег", name_en: "Boiler Installation", price_min: 500, price_max: 2000, unit: "шт" },
        { name_ru: "Ремонт котла", name_tj: "Таъмири дег", name_en: "Boiler Repair", price_min: 200, price_max: 800, unit: "шт" },
        { name_ru: "Монтаж тёплого пола", name_tj: "Насб кардани фарши гарм", name_en: "Underfloor Heating", price_min: 300, price_max: 1000, unit: "м²" },
        { name_ru: "Замена труб отопления", name_tj: "Иваз кардани қубурҳо", name_en: "Heating Pipe Replacement", price_min: 150, price_max: 500, unit: "м" },
        { name_ru: "Диагностика отопления", name_tj: "Диагностикаи гармкунӣ", name_en: "Heating Diagnostics", price_min: 100, price_max: 300, unit: "шт" },
        { name_ru: "Установка терморегулятора", name_tj: "Насб кардани терморегулятор", name_en: "Thermostat Installation", price_min: 100, price_max: 300, unit: "шт" },
      ],
    };

    // Insert new services for new categories
    for (const cat of allCats) {
      if (additionalServices[cat.name_ru]) {
        const { data: existingSvcs } = await supabase.from("services").select("name_ru").eq("category_id", cat.id);
        const existingNames = new Set((existingSvcs || []).map((s: any) => s.name_ru));
        
        const toInsert = additionalServices[cat.name_ru]
          .filter(s => !existingNames.has(s.name_ru))
          .map((s, i) => ({
            ...s,
            category_id: cat.id,
            price_avg: Math.round((s.price_min + s.price_max) / 2),
            sort_order: (existingSvcs?.length || 0) + i + 1,
          }));
        
        if (toInsert.length > 0) {
          await supabase.from("services").insert(toInsert);
        }
      }
    }

    // 3. Seed masters up to 1000
    const { count: masterCount } = await supabase.from("master_listings").select("*", { count: "exact", head: true });
    const mastersNeeded = Math.max(0, 1000 - (masterCount || 0));
    
    if (mastersNeeded > 0) {
      const catNames = allCats.map(c => c.name_ru);
      const batchSize = 100;
      
      for (let batch = 0; batch < Math.ceil(mastersNeeded / batchSize); batch++) {
        const masters = [];
        const count = Math.min(batchSize, mastersNeeded - batch * batchSize);
        
        for (let i = 0; i < count; i++) {
          const firstName = pick(firstNames);
          const lastName = pick(lastNames);
          const numCats = rand(1, 4);
          const selectedCats = pickN(catNames, numCats);
          const numDistricts = rand(1, 3);
          const selectedDistricts = pickN(districts, numDistricts);
          
          masters.push({
            full_name: `${firstName} ${lastName}`,
            phone: `+992${rand(90, 98)}${rand(1000000, 9999999)}`,
            bio: pick(bios),
            service_categories: selectedCats,
            working_districts: selectedDistricts,
            experience_years: rand(1, 20),
            average_rating: randFloat(3.5, 5.0, 1),
            total_reviews: rand(0, 150),
            price_min: rand(50, 300),
            price_max: rand(400, 2000),
            is_active: true,
            latitude: randFloat(dushanbeLat - 0.05, dushanbeLat + 0.05, 6),
            longitude: randFloat(dushanbeLng - 0.06, dushanbeLng + 0.06, 6),
            avatar_url: "",
          });
        }
        
        await supabase.from("master_listings").insert(masters);
      }
    }

    // 4. Seed reviews (we need fake orders first)
    // Create minimal orders and reviews using service role
    const { count: reviewCount } = await supabase.from("reviews").select("*", { count: "exact", head: true });
    const reviewsNeeded = Math.max(0, 3000 - (reviewCount || 0));
    
    if (reviewsNeeded > 0) {
      // Get all masters
      const { data: allMasters } = await supabase.from("master_listings").select("id").limit(500);
      if (allMasters && allMasters.length > 0) {
        // We need a fake client_id - create a deterministic one
        const fakeClientId = "00000000-0000-0000-0000-000000000001";
        
        // Create fake orders and reviews in batches
        const batchSize = 200;
        for (let batch = 0; batch < Math.ceil(reviewsNeeded / batchSize); batch++) {
          const count = Math.min(batchSize, reviewsNeeded - batch * batchSize);
          const orders: any[] = [];
          
          for (let i = 0; i < count; i++) {
            const master = pick(allMasters);
            orders.push({
              client_id: fakeClientId,
              master_id: master.id,
              status: "completed",
              address: pick(districts),
              phone: "+992900000000",
              completed_at: new Date(Date.now() - rand(1, 365) * 86400000).toISOString(),
            });
          }
          
          const { data: insertedOrders } = await supabase.from("orders").insert(orders).select("id, master_id");
          
          if (insertedOrders) {
            const reviews = insertedOrders.map(order => ({
              client_id: fakeClientId,
              master_id: order.master_id,
              order_id: order.id,
              rating: rand(3, 5),
              comment: pick(reviewComments),
              created_at: new Date(Date.now() - rand(1, 300) * 86400000).toISOString(),
            }));
            
            await supabase.from("reviews").insert(reviews);
          }
        }
      }
    }

    const finalCounts = await Promise.all([
      supabase.from("service_categories").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("master_listings").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
    ]);

    return new Response(JSON.stringify({
      success: true,
      counts: {
        categories: finalCounts[0].count,
        services: finalCounts[1].count,
        masters: finalCounts[2].count,
        reviews: finalCounts[3].count,
      }
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
