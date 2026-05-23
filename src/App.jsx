import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const STORAGE_KEY = 'macro-food-calendar-v4';

const mealTypes = ['Colazione', 'Merenda mattina', 'Pranzo', 'Merenda pomeriggio', 'Cena', 'Merenda bonus'];

const defaultMealTargets = {
  Colazione: 0,
  'Merenda mattina': 0,
  Pranzo: 0,
  'Merenda pomeriggio': 0,
  Cena: 0,
  'Merenda bonus': 0,
};

const defaultDailyTargets = { carbs: 0, protein: 0, fat: 0, kcal: 0 };
const defaultMacroPercents = { carbs: 50, protein: 20, fat: 30 };

const carbSpeedOptions = [
  { value: 'slow', label: 'Lento', icon: '↘', color: 'text-green-600' },
  { value: 'medium', label: 'Medio', icon: '↘↘', color: 'text-orange-500' },
  { value: 'fast', label: 'Veloce', icon: '↘↘↘', color: 'text-red-600' },
];

const sourceMeta = {
  manual: { icon: '✍️', label: 'Manuale', color: 'bg-slate-100 text-slate-700' },
  recipe: { icon: '🍲', label: 'Ricetta', color: 'bg-amber-100 text-amber-800' },
  publicVerified: { icon: '🏛️', label: 'Database pubblico verificato', color: 'bg-green-100 text-green-800' },
  publicCheck: { icon: '🌍⚠️', label: 'Pubblico: verifica etichetta', color: 'bg-yellow-100 text-yellow-800' },
};

const extraPublicFoods = [
  { id:'pub_kiwi', name:'Kiwi', carbs:15, protein:1, fat:0.5, kcal:61, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_mandarino', name:'Mandarino', carbs:9, protein:0.7, fat:0.2, kcal:40, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_clementina', name:'Clementina', carbs:9, protein:0.8, fat:0.2, kcal:42, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_pesca', name:'Pesca', carbs:9, protein:0.8, fat:0.1, kcal:39, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_albicocca', name:'Albicocca', carbs:11, protein:1.4, fat:0.4, kcal:48, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_prugna', name:'Prugna', carbs:11, protein:0.7, fat:0.2, kcal:46, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_uva', name:'Uva', carbs:16, protein:0.6, fat:0.3, kcal:67, carbSpeed:'fast', source:'publicVerified' },
  { id:'pub_fragole', name:'Fragole', carbs:6, protein:0.7, fat:0.3, kcal:30, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_lamponi', name:'Lamponi', carbs:5, protein:1.2, fat:0.6, kcal:34, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_mirtilli', name:'Mirtilli', carbs:10, protein:0.7, fat:0.3, kcal:45, carbSpeed:'medium', source:'publicVerified' },

  { id:'pub_anguria', name:'Anguria', carbs:4, protein:0.6, fat:0.2, kcal:16, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_melone', name:'Melone', carbs:7, protein:0.8, fat:0.2, kcal:33, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_ananas', name:'Ananas', carbs:10, protein:0.5, fat:0.1, kcal:40, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_mango', name:'Mango', carbs:15, protein:0.8, fat:0.4, kcal:60, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_papaya', name:'Papaya', carbs:8, protein:0.5, fat:0.3, kcal:32, carbSpeed:'medium', source:'publicVerified' },

  { id:'pub_cocco', name:'Cocco', carbs:15, protein:3, fat:33, kcal:354, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_avocado', name:'Avocado', carbs:2, protein:2, fat:15, kcal:160, carbSpeed:'slow', source:'publicVerified' },

  { id:'pub_fichi', name:'Fichi', carbs:16, protein:0.8, fat:0.3, kcal:65, carbSpeed:'fast', source:'publicVerified' },
  { id:'pub_datteri', name:'Datteri', carbs:75, protein:2, fat:0.4, kcal:280, carbSpeed:'fast', source:'publicVerified' },
  { id:'pub_uvetta', name:'Uvetta', carbs:79, protein:3, fat:0.5, kcal:300, carbSpeed:'fast', source:'publicVerified' },

  { id:'pub_ciliegie', name:'Ciliegie', carbs:13, protein:1, fat:0.3, kcal:50, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_pompelmo', name:'Pompelmo', carbs:6, protein:0.6, fat:0.1, kcal:26, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_lime', name:'Lime', carbs:8, protein:0.7, fat:0.2, kcal:30, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_limone', name:'Limone', carbs:3, protein:0.6, fat:0.1, kcal:15, carbSpeed:'slow', source:'publicVerified' },

  { id:'pub_frutta_mista', name:'Macedonia frutta', carbs:12, protein:0.8, fat:0.2, kcal:50, carbSpeed:'medium', source:'publicCheck' },
  { id:'pub_avena', name:'Fiocchi avena', carbs:60, protein:13, fat:7, kcal:389, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_muesli', name:'Muesli', carbs:64, protein:10, fat:8, kcal:380, carbSpeed:'medium', source:'publicCheck' },
  { id:'pub_cornflakes', name:'Cornflakes', carbs:84, protein:7, fat:1, kcal:360, carbSpeed:'fast', source:'publicCheck' },

  { id:'pub_lenticchie', name:'Lenticchie', carbs:40, protein:23, fat:1, kcal:291, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_ceci', name:'Ceci', carbs:46, protein:19, fat:6, kcal:316, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_fagioli', name:'Fagioli borlotti', carbs:47, protein:23, fat:2, kcal:300, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_piselli', name:'Piselli', carbs:15, protein:5, fat:0.4, kcal:80, carbSpeed:'medium', source:'publicVerified' },

  { id:'pub_zucchine', name:'Zucchine', carbs:3, protein:1.3, fat:0.1, kcal:17, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_melanzane', name:'Melanzane', carbs:6, protein:1, fat:0.2, kcal:24, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_peperoni', name:'Peperoni', carbs:6, protein:1, fat:0.3, kcal:26, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_broccoli', name:'Broccoli', carbs:3, protein:3, fat:0.4, kcal:27, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_spinaci', name:'Spinaci', carbs:2, protein:3, fat:0.3, kcal:23, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_carote', name:'Carote', carbs:8, protein:1, fat:0.2, kcal:35, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_pomodori', name:'Pomodori', carbs:3, protein:1, fat:0.2, kcal:18, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_insalata', name:'Insalata', carbs:2, protein:1, fat:0.2, kcal:15, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_cetrioli', name:'Cetrioli', carbs:2, protein:0.7, fat:0.1, kcal:12, carbSpeed:'slow', source:'publicVerified' },

  { id:'pub_tonno', name:'Tonno naturale', carbs:0, protein:25, fat:1, kcal:110, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_tonno_olio', name:'Tonno olio oliva', carbs:0, protein:23, fat:15, kcal:240, carbSpeed:'slow', source:'publicCheck' },
  { id:'pub_gamberi', name:'Gamberi', carbs:1, protein:20, fat:1, kcal:90, carbSpeed:'slow', source:'publicVerified' },

  { id:'pub_bresaola', name:'Bresaola', carbs:0, protein:32, fat:2, kcal:150, carbSpeed:'slow', source:'publicCheck' },
  { id:'pub_prosciutto_cotto', name:'Prosciutto cotto', carbs:1, protein:20, fat:8, kcal:170, carbSpeed:'slow', source:'publicCheck' },
  { id:'pub_prosciutto_crudo', name:'Prosciutto crudo', carbs:0, protein:27, fat:18, kcal:270, carbSpeed:'slow', source:'publicCheck' },

  { id:'pub_parmigiano', name:'Parmigiano Reggiano', carbs:0, protein:33, fat:28, kcal:402, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_grana', name:'Grana Padano', carbs:0, protein:33, fat:29, kcal:398, carbSpeed:'slow', source:'publicVerified' },
  { id:'pub_ricotta', name:'Ricotta', carbs:3, protein:8, fat:10, kcal:145, carbSpeed:'slow', source:'publicCheck' },
  { id:'pub_gorgonzola', name:'Gorgonzola', carbs:1, protein:19, fat:27, kcal:330, carbSpeed:'slow', source:'publicCheck' },

  { id:'pub_biscotti', name:'Biscotti secchi', carbs:72, protein:8, fat:12, kcal:430, carbSpeed:'fast', source:'publicCheck' },
  { id:'pub_fette_biscottate', name:'Fette biscottate', carbs:77, protein:10, fat:6, kcal:400, carbSpeed:'fast', source:'publicCheck' },
  { id:'pub_croissant', name:'Croissant', carbs:45, protein:8, fat:21, kcal:406, carbSpeed:'fast', source:'publicCheck' },

  { id:'pub_pizza_margherita', name:'Pizza Margherita', carbs:33, protein:11, fat:10, kcal:270, carbSpeed:'fast', source:'publicCheck' },
  { id:'pub_pizza_salami', name:'Pizza Salame', carbs:31, protein:12, fat:14, kcal:310, carbSpeed:'fast', source:'publicCheck' },

  { id:'pub_gelato_cioccolato', name:'Gelato cioccolato', carbs:28, protein:4, fat:9, kcal:210, carbSpeed:'fast', source:'publicCheck' },
  { id:'pub_gelato_fragola', name:'Gelato fragola', carbs:24, protein:2, fat:4, kcal:150, carbSpeed:'fast', source:'publicCheck' },

  { id:'pub_miele', name:'Miele', carbs:82, protein:0.3, fat:0, kcal:304, carbSpeed:'fast', source:'publicVerified' },
  { id:'pub_cioccolato_fondente', name:'Cioccolato fondente', carbs:46, protein:7, fat:43, kcal:600, carbSpeed:'medium', source:'publicCheck' },
  { id:'pub_cioccolato_latte', name:'Cioccolato latte', carbs:57, protein:7, fat:30, kcal:535, carbSpeed:'fast', source:'publicCheck' },

  { id:'pub_orzo', name:'Orzo', carbs:73, protein:10, fat:2, kcal:352, carbSpeed:'medium', source:'publicVerified' },
  { id:'pub_couscous', name:'Cous cous', carbs:72, protein:13, fat:2, kcal:350, carbSpeed:'medium', source:'publicVerified' },

  { id:'pub_banana_chips', name:'Banana chips', carbs:58, protein:2, fat:34, kcal:520, carbSpeed:'fast', source:'publicCheck' },
  { id:'pub_frutta_secca_mix', name:'Mix frutta secca', carbs:18, protein:18, fat:48, kcal:580, carbSpeed:'slow', source:'publicCheck' },
  { id: 'pub_gnocchi', name: 'Gnocchi di patate', carbs: 30, protein: 3.9, fat: 0.2, kcal: 130, carbSpeed: 'fast', source: 'publicCheck' },
  { id: 'pub_ravioli', name: 'Ravioli ricotta spinaci', carbs: 28, protein: 8, fat: 4, kcal: 185, carbSpeed: 'medium', source: 'publicCheck' },
  { id: 'pub_lasagne', name: 'Lasagne', carbs: 15, protein: 8, fat: 10, kcal: 190, carbSpeed: 'medium', source: 'publicCheck' },
  { id: 'pub_piada', name: 'Piadina', carbs: 50, protein: 8, fat: 13, kcal: 330, carbSpeed: 'fast', source: 'publicCheck' },
  { id: 'pub_focaccia', name: 'Focaccia', carbs: 43, protein: 8, fat: 10, kcal: 290, carbSpeed: 'fast', source: 'publicCheck' },

  { id: 'pub_mozzarella_pizza', name: 'Mozzarella pizza', carbs: 1, protein: 22, fat: 20, kcal: 280, carbSpeed: 'slow', source: 'publicCheck' },
  { id: 'pub_stracchino', name: 'Stracchino', carbs: 2, protein: 11, fat: 25, kcal: 300, carbSpeed: 'slow', source: 'publicCheck' },

  { id: 'pub_salame', name: 'Salame', carbs: 1, protein: 25, fat: 32, kcal: 390, carbSpeed: 'slow', source: 'publicCheck' },
  { id: 'pub_salsiccia', name: 'Salsiccia', carbs: 1, protein: 16, fat: 27, kcal: 310, carbSpeed: 'slow', source: 'publicCheck' },

  { id: 'pub_cola', name: 'Coca Cola', carbs: 10.6, protein: 0, fat: 0, kcal: 42, carbSpeed: 'fast', source: 'publicCheck' },
  { id: 'pub_succo_arancia', name: 'Succo arancia', carbs: 8.5, protein: 0.6, fat: 0.1, kcal: 36, carbSpeed: 'fast', source: 'publicCheck' },

  { id: 'pub_nutella', name: 'Crema spalmabile cacao', carbs: 57, protein: 6, fat: 31, kcal: 530, carbSpeed: 'fast', source: 'publicCheck' },
  { id: 'pub_marmellata', name: 'Marmellata', carbs: 58, protein: 0.5, fat: 0.1, kcal: 230, carbSpeed: 'fast', source: 'publicCheck' },

  { id: 'pub_ketchup', name: 'Ketchup', carbs: 23, protein: 1.3, fat: 0.2, kcal: 100, carbSpeed: 'fast', source: 'publicCheck' },
  { id: 'pub_maionese', name: 'Maionese', carbs: 1, protein: 1, fat: 78, kcal: 700, carbSpeed: 'slow', source: 'publicCheck' },

  { id: 'pub_hamburger', name: 'Hamburger bovino', carbs: 0, protein: 19, fat: 15, kcal: 215, carbSpeed: 'slow', source: 'publicCheck' },
  { id: 'pub_wurstel', name: 'Wurstel', carbs: 2, protein: 12, fat: 22, kcal: 250, carbSpeed: 'slow', source: 'publicCheck' },

  { id: 'pub_panbauletto', name: 'Pan bauletto', carbs: 49, protein: 8, fat: 5, kcal: 265, carbSpeed: 'fast', source: 'publicCheck' },
  { id: 'pub_brioche', name: 'Brioche', carbs: 48, protein: 8, fat: 18, kcal: 390, carbSpeed: 'fast', source: 'publicCheck' },

  { id: 'pub_gallette_riso', name: 'Gallette di riso', carbs: 81, protein: 7, fat: 2.8, kcal: 387, carbSpeed: 'fast', source: 'publicCheck' },
  { id: 'pub_popcorn', name: 'Popcorn', carbs: 78, protein: 12, fat: 4, kcal: 375, carbSpeed: 'medium', source: 'publicCheck' },
   { id:'pub_tortellini', name:'Tortellini', carbs:30, protein:12, fat:7, kcal:230, carbSpeed:'medium', source:'publicCheck' },
    { id:'pub_tagliatelle', name:'Tagliatelle', carbs:72, protein:13, fat:2, kcal:360, carbSpeed:'medium', source:'publicVerified' },
    { id:'pub_polenta', name:'Polenta', carbs:80, protein:8, fat:1, kcal:360, carbSpeed:'fast', source:'publicVerified' },
    { id:'pub_semolino', name:'Semolino', carbs:73, protein:11, fat:1, kcal:340, carbSpeed:'fast', source:'publicVerified' },
    { id:'pub_farrotto', name:'Farro', carbs:67, protein:15, fat:2, kcal:335, carbSpeed:'medium', source:'publicVerified' },
    { id:'pub_quinoa', name:'Quinoa', carbs:57, protein:14, fat:6, kcal:368, carbSpeed:'medium', source:'publicVerified' },
    { id:'pub_bulgur', name:'Bulgur', carbs:76, protein:12, fat:1, kcal:342, carbSpeed:'medium', source:'publicVerified' },
    { id:'pub_crecker_integrali', name:'Crackers integrali', carbs:64, protein:10, fat:13, kcal:420, carbSpeed:'medium', source:'publicCheck' },
    { id:'pub_taralli', name:'Taralli', carbs:72, protein:9, fat:14, kcal:470, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_pancarre', name:'Pan carré', carbs:49, protein:8, fat:4, kcal:260, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_burro_arachidi', name:'Burro di arachidi', carbs:12, protein:25, fat:50, kcal:590, carbSpeed:'slow', source:'publicCheck' },
    { id:'pub_pistacchi', name:'Pistacchi', carbs:8, protein:18, fat:54, kcal:610, carbSpeed:'slow', source:'publicVerified' },
    { id:'pub_anacardi', name:'Anacardi', carbs:22, protein:18, fat:44, kcal:553, carbSpeed:'slow', source:'publicVerified' },

    { id:'pub_fesa_pollo', name:'Fesa pollo arrosto', carbs:1, protein:22, fat:3, kcal:120, carbSpeed:'slow', source:'publicCheck' },
    { id:'pub_speck', name:'Speck', carbs:1, protein:29, fat:19, kcal:290, carbSpeed:'slow', source:'publicCheck' },
    { id:'pub_mortadella', name:'Mortadella', carbs:1, protein:15, fat:28, kcal:320, carbSpeed:'slow', source:'publicCheck' },

    { id:'pub_sgombro', name:'Sgombro', carbs:0, protein:19, fat:11, kcal:180, carbSpeed:'slow', source:'publicVerified' },
    { id:'pub_seppie', name:'Seppie', carbs:1, protein:16, fat:1, kcal:72, carbSpeed:'slow', source:'publicVerified' },
    { id:'pub_cozze', name:'Cozze', carbs:3, protein:11, fat:2, kcal:86, carbSpeed:'slow', source:'publicVerified' },

    { id:'pub_tofu', name:'Tofu', carbs:2, protein:13, fat:8, kcal:140, carbSpeed:'slow', source:'publicCheck' },
    { id:'pub_seitan', name:'Seitan', carbs:5, protein:25, fat:2, kcal:140, carbSpeed:'slow', source:'publicCheck' },

    { id:'pub_fagiolini', name:'Fagiolini', carbs:3, protein:2, fat:0.2, kcal:25, carbSpeed:'slow', source:'publicVerified' },
    { id:'pub_zucca', name:'Zucca', carbs:5, protein:1, fat:0.1, kcal:20, carbSpeed:'medium', source:'publicVerified' },
    { id:'pub_cipolla', name:'Cipolla', carbs:7, protein:1, fat:0.1, kcal:28, carbSpeed:'medium', source:'publicVerified' },
    { id:'pub_aglio', name:'Aglio', carbs:31, protein:6, fat:0.5, kcal:149, carbSpeed:'medium', source:'publicVerified' },

    { id:'pub_cavolo', name:'Cavolo', carbs:4, protein:2, fat:0.1, kcal:27, carbSpeed:'slow', source:'publicVerified' },
    { id:'pub_funghi', name:'Funghi', carbs:3, protein:3, fat:0.3, kcal:22, carbSpeed:'slow', source:'publicVerified' },

    { id:'pub_coca_zero', name:'Coca Cola Zero', carbs:0, protein:0, fat:0, kcal:1, carbSpeed:'slow', source:'publicCheck' },
    { id:'pub_the_pesca', name:'Tè pesca', carbs:7, protein:0, fat:0, kcal:28, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_sprite', name:'Sprite', carbs:9, protein:0, fat:0, kcal:37, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_fanta', name:'Fanta', carbs:12, protein:0, fat:0, kcal:48, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_succhi_frutta', name:'Succo frutta misto', carbs:12, protein:0.3, fat:0, kcal:48, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_patatine', name:'Patatine chips', carbs:50, protein:6, fat:35, kcal:540, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_salatini', name:'Salatini', carbs:65, protein:11, fat:14, kcal:430, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_wafer', name:'Wafer', carbs:67, protein:7, fat:24, kcal:520, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_merendina', name:'Merendina', carbs:58, protein:6, fat:22, kcal:470, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_pandoro', name:'Pandoro', carbs:57, protein:7, fat:24, kcal:450, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_panettone', name:'Panettone', carbs:51, protein:7, fat:16, kcal:390, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_tiramisu', name:'Tiramisù', carbs:30, protein:5, fat:17, kcal:290, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_cheesecake', name:'Cheesecake', carbs:32, protein:6, fat:22, kcal:340, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_budino', name:'Budino', carbs:20, protein:3, fat:4, kcal:130, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_crema_gelato', name:'Gelato crema', carbs:24, protein:4, fat:8, kcal:180, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_kinder', name:'Kinder cioccolato', carbs:53, protein:8, fat:34, kcal:570, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_bounty', name:'Bounty', carbs:60, protein:4, fat:28, kcal:500, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_snickers', name:'Snickers', carbs:61, protein:9, fat:24, kcal:510, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_mars', name:'Mars', carbs:68, protein:4, fat:17, kcal:450, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_yogurt_frutta', name:'Yogurt alla frutta', carbs:13, protein:3.5, fat:3, kcal:95, carbSpeed:'medium', source:'publicCheck' },
    { id:'pub_kefir', name:'Kefir', carbs:4, protein:3, fat:2, kcal:50, carbSpeed:'slow', source:'publicCheck' },

    { id:'pub_latte_avena', name:'Latte avena', carbs:6, protein:1, fat:1.5, kcal:45, carbSpeed:'medium', source:'publicCheck' },
    { id:'pub_latte_soia', name:'Latte soia', carbs:2, protein:3, fat:2, kcal:40, carbSpeed:'slow', source:'publicCheck' },

    { id:'pub_hummus', name:'Hummus', carbs:14, protein:7, fat:17, kcal:240, carbSpeed:'slow', source:'publicCheck' },
    { id:'pub_guacamole', name:'Guacamole', carbs:8, protein:2, fat:15, kcal:170, carbSpeed:'slow', source:'publicCheck' },

    { id:'pub_kebab', name:'Kebab', carbs:18, protein:12, fat:10, kcal:210, carbSpeed:'medium', source:'publicCheck' },
    { id:'pub_hotdog', name:'Hot dog', carbs:22, protein:10, fat:16, kcal:270, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_hamburger_mc', name:'Hamburger fast food', carbs:30, protein:13, fat:12, kcal:280, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_nuggets', name:'Chicken nuggets', carbs:18, protein:15, fat:18, kcal:290, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_sushi', name:'Sushi', carbs:28, protein:6, fat:2, kcal:150, carbSpeed:'medium', source:'publicCheck' },
    { id:'pub_ramen', name:'Ramen', carbs:20, protein:6, fat:7, kcal:170, carbSpeed:'medium', source:'publicCheck' },

    { id:'pub_gazosa', name:'Gassosa', carbs:11, protein:0, fat:0, kcal:44, carbSpeed:'fast', source:'publicCheck' },
    { id:'pub_estathe', name:'Estathé', carbs:7.8, protein:0, fat:0, kcal:32, carbSpeed:'fast', source:'publicCheck' },

    { id:'pub_acqua_cocco', name:'Acqua cocco', carbs:4, protein:0.5, fat:0.2, kcal:20, carbSpeed:'medium', source:'publicCheck' },
    { id:'pub_barretta', name:'Barretta cereali', carbs:65, protein:7, fat:12, kcal:410, carbSpeed:'fast', source:'publicCheck' }
  
];
const publicFoods = [
  { id: 'pub_pasta_secca', name: 'Pasta secca', carbs: 75, protein: 13, fat: 1.5, kcal: 365, carbSpeed: 'medium', source: 'publicVerified' },
  { id: 'pub_riso_bianco', name: 'Riso bianco crudo', carbs: 78, protein: 7, fat: 0.6, kcal: 360, carbSpeed: 'fast', source: 'publicVerified' },
  { id: 'pub_pane_comune', name: 'Pane comune', carbs: 58, protein: 8.9, fat: 0.4, kcal: 275, carbSpeed: 'fast', source: 'publicVerified' },
  { id: 'pub_pane_integrale', name: 'Pane integrale', carbs: 48, protein: 8.5, fat: 1.8, kcal: 243, carbSpeed: 'medium', source: 'publicVerified' },
  { id: 'pub_patate', name: 'Patate crude', carbs: 17.9, protein: 2.1, fat: 1, kcal: 85, carbSpeed: 'medium', source: 'publicVerified' },
  { id: 'pub_banana', name: 'Banana', carbs: 15.4, protein: 1.2, fat: 0.3, kcal: 65, carbSpeed: 'fast', source: 'publicVerified' },
  { id: 'pub_mela', name: 'Mela', carbs: 13.7, protein: 0.3, fat: 0.1, kcal: 53, carbSpeed: 'medium', source: 'publicVerified' },
  { id: 'pub_pera', name: 'Pera', carbs: 15.1, protein: 0.4, fat: 0.3, kcal: 58, carbSpeed: 'medium', source: 'publicVerified' },
  { id: 'pub_arancia', name: 'Arancia', carbs: 7.8, protein: 0.7, fat: 0.2, kcal: 34, carbSpeed: 'medium', source: 'publicVerified' },
  { id: 'pub_latte_intero', name: 'Latte intero', carbs: 4.9, protein: 3.3, fat: 3.6, kcal: 64, carbSpeed: 'medium', source: 'publicVerified' },
  { id: 'pub_yogurt_intero', name: 'Yogurt intero naturale', carbs: 4.3, protein: 3.8, fat: 3.9, kcal: 66, carbSpeed: 'medium', source: 'publicVerified' },
  { id: 'pub_uovo', name: 'Uovo intero', carbs: 0, protein: 12.4, fat: 8.7, kcal: 128, carbSpeed: 'slow', source: 'publicVerified' },
  { id: 'pub_pollo_petto', name: 'Petto di pollo', carbs: 0, protein: 23.3, fat: 0.8, kcal: 100, carbSpeed: 'slow', source: 'publicVerified' },
  { id: 'pub_tacchino', name: 'Fesa di tacchino', carbs: 0, protein: 24, fat: 1.2, kcal: 107, carbSpeed: 'slow', source: 'publicVerified' },
  { id: 'pub_merluzzo', name: 'Merluzzo', carbs: 0, protein: 17, fat: 0.3, kcal: 71, carbSpeed: 'slow', source: 'publicVerified' },
  { id: 'pub_salmone', name: 'Salmone', carbs: 0, protein: 18.4, fat: 12, kcal: 185, carbSpeed: 'slow', source: 'publicVerified' },
  { id: 'pub_olio_oliva', name: 'Olio extravergine oliva', carbs: 0, protein: 0, fat: 99.9, kcal: 899, carbSpeed: 'slow', source: 'publicVerified' },
  { id: 'pub_passata', name: 'Passata di pomodoro', carbs: 5.1, protein: 1.6, fat: 0.2, kcal: 30, carbSpeed: 'medium', source: 'publicCheck' },
  { id: 'pub_zucchero', name: 'Zucchero', carbs: 100, protein: 0, fat: 0, kcal: 392, carbSpeed: 'fast', source: 'publicVerified' },
  { id: 'pub_sale', name: 'Sale', carbs: 0, protein: 0, fat: 0, kcal: 0, carbSpeed: 'slow', source: 'publicVerified' },
];

publicFoods.push(...extraPublicFoods);

const defaultFoods = [
  { id: 1, name: 'Riso', carbs: 78, protein: 7, fat: 1, kcal: 349, carbSpeed: 'fast', source: 'manual' },
  { id: 2, name: 'Pasta', carbs: 75, protein: 13, fat: 2, kcal: 370, carbSpeed: 'medium', source: 'manual' },
  { id: 3, name: 'Pane', carbs: 50, protein: 8, fat: 3, kcal: 259, carbSpeed: 'fast', source: 'manual' },
];

const dateKeyLocal = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const monthKeyLocal = (date = new Date()) => dateKeyLocal(date).slice(0, 7);
const todayKey = () => dateKeyLocal(new Date());
const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;
const uid = () => Date.now() + Math.floor(Math.random() * 10000);

function calcEntry(food, grams) {
  const g = Number(grams) || 0;
  if (!food) return { carbs: 0, protein: 0, fat: 0, kcal: 0 };
  return {
    carbs: round1((food.carbs * g) / 100),
    protein: round1((food.protein * g) / 100),
    fat: round1((food.fat * g) / 100),
    kcal: round1((food.kcal * g) / 100),
  };
}

function carbSpeedMeta(speed) {
  return carbSpeedOptions.find((x) => x.value === speed) || carbSpeedOptions[1];
}

function foodSourceMeta(food) {
  if (food?.isRecipe) return sourceMeta.recipe;
  return sourceMeta[food?.source || 'manual'] || sourceMeta.manual;
}

function scaleRecipeIngredients(food, grams) {
  if (!food?.isRecipe || !Array.isArray(food.ingredients)) return [];
  const factor = (Number(grams) || 0) / (food.recipeTotalWeight || 100);
  return food.ingredients.map((ing) => ({ ...ing, scaledGrams: round1(ing.grams * factor) }));
}

function getWeekRange(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: dateKeyLocal(monday),
    end: dateKeyLocal(sunday),
  };
}

function getUsageColor(count) {
  if (count >= 11) return 'bg-red-200';
  if (count >= 8) return 'bg-orange-200';
  if (count >= 5) return 'bg-green-200';
  return 'bg-white';
}

function portionLevel(portions) {
  if (portions >= 10) return { label: 'rosso', bg: 'bg-red-200', text: 'text-red-900', color: '#ef4444' };
  if (portions >= 7) return { label: 'arancio', bg: 'bg-orange-200', text: 'text-orange-900', color: '#f97316' };
  if (portions >= 4) return { label: 'verde', bg: 'bg-green-200', text: 'text-green-900', color: '#22c55e' };
  return { label: 'bianco', bg: 'bg-white', text: 'text-slate-700', color: '#ffffff' };
}

export default function MacroFoodCalendarApp() {
  const [foods, setFoods] = useState(defaultFoods);
  const [days, setDays] = useState({});
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [calendarMonth, setCalendarMonth] = useState(monthKeyLocal());
  const [search, setSearch] = useState('');
  const [publicSearch, setPublicSearch] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState(1);
  const [addGrams, setAddGrams] = useState('100');
  const [addCarbs, setAddCarbs] = useState('');
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [swapEntry, setSwapEntry] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState('Colazione');
  const [mealTargets, setMealTargets] = useState(defaultMealTargets);
  const [dailyTargets, setDailyTargets] = useState(defaultDailyTargets);
  const [dailyTargetAuto, setDailyTargetAuto] = useState(true);
  const [macroPercents, setMacroPercents] = useState(defaultMacroPercents);
  const [showMealTargets, setShowMealTargets] = useState(false);
  const [foodForm, setFoodForm] = useState({ name: '', carbs: '', protein: '', fat: '', kcal: '', carbSpeed: 'medium', portionSize: '' });
  const [showRecipeCreator, setShowRecipeCreator] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [recipeName, setRecipeName] = useState('');
  const [recipeSpeed, setRecipeSpeed] = useState('medium');
  const [recipeRows, setRecipeRows] = useState([{ id: uid(), foodId: 1, grams: '' }]);
  const [recipeViewEntry, setRecipeViewEntry] = useState(null);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    document.title = '🍝 Cosa mangio';

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.foods) setFoods(saved.foods);
      if (saved?.days) setDays(saved.days);
      if (saved?.selectedDate) setSelectedDate(saved.selectedDate);
      if (saved?.calendarMonth) setCalendarMonth(saved.calendarMonth);
      if (saved?.mealTargets) setMealTargets({ ...defaultMealTargets, ...saved.mealTargets });
      if (saved?.dailyTargets) setDailyTargets({ ...defaultDailyTargets, ...saved.dailyTargets });
      if (typeof saved?.dailyTargetAuto === 'boolean') setDailyTargetAuto(saved.dailyTargetAuto);
      if (saved?.macroPercents) setMacroPercents({ ...defaultMacroPercents, ...saved.macroPercents });
    } catch {}

    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;

    const dataToSave = {
      foods,
      days,
      selectedDate,
      calendarMonth,
      mealTargets,
      dailyTargets,
      dailyTargetAuto,
      macroPercents,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    storageLoaded,
    foods,
    days,
    selectedDate,
    calendarMonth,
    mealTargets,
    dailyTargets,
    dailyTargetAuto,
    macroPercents,
  ]);

  useEffect(() => {
    const saveNow = () => {
      if (!storageLoaded) return;

      const dataToSave = {
        foods,
        days,
        selectedDate,
        calendarMonth,
        mealTargets,
        dailyTargets,
        dailyTargetAuto,
        macroPercents,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    };
    window.addEventListener('beforeunload', saveNow);
    document.addEventListener('visibilitychange', saveNow);
    return () => {
      window.removeEventListener('beforeunload', saveNow);
      document.removeEventListener('visibilitychange', saveNow);
    };
  }, [storageLoaded, foods, days, selectedDate, calendarMonth, mealTargets, dailyTargets, dailyTargetAuto, macroPercents]);

  const selectedFood = foods.find((f) => f.id === Number(selectedFoodId));
  const entries = days[selectedDate] || [];
  const filteredFoods = foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPublicFoods = publicFoods.filter((f) => f.name.toLowerCase().includes(publicSearch.toLowerCase()));

  const weeklyIngredientUsage = useMemo(() => {
    const { start, end } = getWeekRange(selectedDate);
    const gramsByFood = {};

    Object.entries(days).forEach(([date, entries]) => {
      if (date < start || date > end) return;
      entries.forEach((entry) => {
        const food = foods.find((f) => f.id === entry.foodId);
        if (!food) return;
        if (food.isRecipe && Array.isArray(food.ingredients)) {
          const factor = (Number(entry.grams) || 0) / (food.recipeTotalWeight || 100);
          food.ingredients.forEach((ing) => {
            gramsByFood[ing.foodId] = (gramsByFood[ing.foodId] || 0) + ing.grams * factor;
          });
        } else {
          gramsByFood[food.id] = (gramsByFood[food.id] || 0) + (Number(entry.grams) || 0);
        }
      });
    });

    const result = {};
    foods.forEach((food) => {
      const grams = gramsByFood[food.id] || 0;
      const portionSize = Number(food.portionSize) || 100;
      const portions = grams / portionSize;
      result[food.id] = {
        grams: round1(grams),
        portions: round1(portions),
        level: portionLevel(portions),
      };
    });

    return result;
  }, [days, foods, selectedDate]);

  const weeklyFoodUsage = useMemo(() => {
    const { start, end } = getWeekRange(selectedDate);
    const counts = {};
    Object.entries(days).forEach(([date, entries]) => {
      if (date < start || date > end) return;
      entries.forEach((entry) => {
        counts[entry.foodId] = (counts[entry.foodId] || 0) + 1;
      });
    });
    return counts;
  }, [days, selectedDate]);

  const monthDays = useMemo(() => {
    const [year, month] = calendarMonth.split('-').map(Number);
    const y = year;
    const m = month - 1;
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startOffset = (first.getDay() + 6) % 7;
    const arr = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push({ day: d, key: dateKeyLocal(new Date(y, m, d)) });
    while (arr.length < 42) arr.push(null);
    return arr.slice(0, 42);
  }, [calendarMonth]);

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        const food = foods.find((f) => f.id === entry.foodId);
        const m = calcEntry(food, entry.grams);
        acc.carbs += m.carbs;
        acc.protein += m.protein;
        acc.fat += m.fat;
        acc.kcal += m.kcal;
        return acc;
      },
      { carbs: 0, protein: 0, fat: 0, kcal: 0 }
    );
  }, [entries, foods]);

  const total = { carbs: round1(totals.carbs), protein: round1(totals.protein), fat: round1(totals.fat), kcal: round1(totals.kcal) };
  const macroCalories = { carbs: total.carbs * 4, protein: total.protein * 4, fat: total.fat * 9 };
  const macroTotalCalories = macroCalories.carbs + macroCalories.protein + macroCalories.fat;
  const macroPerc = {
    carbs: macroTotalCalories ? Math.round((macroCalories.carbs * 100) / macroTotalCalories) : 0,
    protein: macroTotalCalories ? Math.round((macroCalories.protein * 100) / macroTotalCalories) : 0,
    fat: macroTotalCalories ? Math.round((macroCalories.fat * 100) / macroTotalCalories) : 0,
  };
  const pieData = [
    { name: 'Carboidrati', value: macroPerc.carbs, color: '#22c55e' },
    { name: 'Proteine', value: macroPerc.protein, color: '#3b82f6' },
    { name: 'Grassi', value: macroPerc.fat, color: '#f97316' },
  ].filter((item) => item.value > 0);

  const autoCarbsTarget = round1(mealTypes.reduce((sum, meal) => sum + (Number(mealTargets[meal]) || 0), 0));
  const autoCaloriesTarget = macroPercents.carbs > 0 ? round1((autoCarbsTarget * 4 * 100) / macroPercents.carbs) : 0;
  const effectiveDailyTargets = dailyTargetAuto
    ? {
        carbs: autoCarbsTarget,
        protein: round1((autoCaloriesTarget * (Number(macroPercents.protein) || 0)) / 100 / 4),
        fat: round1((autoCaloriesTarget * (Number(macroPercents.fat) || 0)) / 100 / 9),
        kcal: autoCaloriesTarget,
      }
    : dailyTargets;

  function targetInfo(current, target) {
    const t = Number(target) || 0;
    const c = Number(current) || 0;
    if (!t) return { text: 'Obiettivo non impostato', percent: 0, done: false };
    const diff = round1(t - c);
    return { text: diff >= 0 ? `Mancano ${diff}` : `Superato di ${Math.abs(diff)}`, percent: Math.min(100, Math.round((c * 100) / t)), done: c >= t };
  }

  function moveMonth(delta) {
    const [year, month] = calendarMonth.split('-').map(Number);
    const next = new Date(year, month - 1 + delta, 1);
    setCalendarMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  }

  function goToday() {
    const today = todayKey();
    setSelectedDate(today);
    setCalendarMonth(monthKeyLocal());
  }

  function saveFood() {
    if (!foodForm.name.trim()) return;
    const data = {
      name: foodForm.name.trim(),
      carbs: Number(foodForm.carbs) || 0,
      protein: Number(foodForm.protein) || 0,
      fat: Number(foodForm.fat) || 0,
      carbSpeed: foodForm.carbSpeed || 'medium',
      source: 'manual',
      kcal: Number(foodForm.kcal) || round1((Number(foodForm.carbs) || 0) * 4 + (Number(foodForm.protein) || 0) * 4 + (Number(foodForm.fat) || 0) * 9),
      portionSize: Number(foodForm.portionSize) || 100,
    };
    if (editingFoodId) {
      setFoods((prev) => prev.map((f) => (f.id === editingFoodId ? { ...f, ...data } : f)));
      setEditingFoodId(null);
    } else {
      const newFood = { id: uid(), ...data };
      setFoods((prev) => [...prev, newFood]);
      setSelectedFoodId(newFood.id);
    }
    setFoodForm({ name: '', carbs: '', protein: '', fat: '', kcal: '', carbSpeed: 'medium', portionSize: '' });
  }

  function importPublicFood(food) {
    const exists = foods.some((f) => f.publicId === food.id || f.name.toLowerCase() === food.name.toLowerCase());
    if (exists) return;
    const newFood = { ...food, id: uid(), publicId: food.id };
    setFoods((prev) => [...prev, newFood]);
    setSelectedFoodId(newFood.id);
  }

  function editFood(food) {
    setEditingFoodId(food.id);
    setFoodForm({ name: food.name, carbs: food.carbs, protein: food.protein, fat: food.fat, kcal: food.kcal, carbSpeed: food.carbSpeed || 'medium', portionSize: food.portionSize || 100 });
  }

  function openRecipeEditor(recipe) {
    setEditingRecipeId(recipe.id);
    setRecipeName(recipe.name);
    setRecipeSpeed(recipe.carbSpeed || 'medium');
    setRecipeRows((recipe.ingredients || []).map((ing) => ({ id: uid(), foodId: ing.foodId, grams: ing.grams })));
    setShowRecipeCreator(true);
  }

  function createRecipe() {
    if (!recipeName.trim()) return;
    const validRows = recipeRows
      .map((row) => ({ ...row, food: foods.find((f) => f.id === Number(row.foodId)), grams: Number(row.grams) || 0 }))
      .filter((row) => row.food && row.grams > 0);
    const totalWeight = validRows.reduce((sum, row) => sum + row.grams, 0);
    if (totalWeight <= 0) return;
    const totalsRecipe = validRows.reduce(
      (acc, row) => {
        const m = calcEntry(row.food, row.grams);
        acc.carbs += m.carbs;
        acc.protein += m.protein;
        acc.fat += m.fat;
        acc.kcal += m.kcal;
        return acc;
      },
      { carbs: 0, protein: 0, fat: 0, kcal: 0 }
    );
    const newRecipe = {
      id: editingRecipeId || uid(),
      name: recipeName.trim(),
      carbs: round1((totalsRecipe.carbs * 100) / totalWeight),
      protein: round1((totalsRecipe.protein * 100) / totalWeight),
      fat: round1((totalsRecipe.fat * 100) / totalWeight),
      kcal: round1((totalsRecipe.kcal * 100) / totalWeight),
      carbSpeed: recipeSpeed,
      source: 'recipe',
      isRecipe: true,
      recipeTotalWeight: round1(totalWeight),
      ingredients: validRows.map((row) => ({ foodId: row.food.id, name: row.food.name, grams: row.grams })),
    };
    if (editingRecipeId) setFoods((prev) => prev.map((f) => (f.id === editingRecipeId ? newRecipe : f)));
    else setFoods((prev) => [...prev, newRecipe]);
    setSelectedFoodId(newRecipe.id);
    setEditingRecipeId(null);
    setRecipeName('');
    setRecipeSpeed('medium');
    setRecipeRows([{ id: uid(), foodId: foods[0]?.id || 1, grams: '' }]);
    setShowRecipeCreator(false);
  }

  function deleteFood(id) {
    setFoods((prev) => prev.filter((f) => f.id !== id));
    setDays((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((date) => {
        copy[date] = copy[date].filter((e) => e.foodId !== id);
      });
      return copy;
    });
  }

  function addEntry() {
    if (!selectedFood) return;
    let grams = Number(addGrams) || 0;
    const targetCarbs = Number(addCarbs) || 0;
    if (targetCarbs > 0 && selectedFood.carbs > 0) grams = (targetCarbs / selectedFood.carbs) * 100;
    if (grams <= 0) return;
    const entry = { id: uid(), foodId: selectedFood.id, grams: round1(grams), time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }), meal: selectedMeal };
    setDays((prev) => ({ ...prev, [selectedDate]: [...(prev[selectedDate] || []), entry] }));
    setAddCarbs('');
  }

  function updateEntryGrams(entryId, grams) {
    setDays((prev) => ({ ...prev, [selectedDate]: (prev[selectedDate] || []).map((e) => (e.id === entryId ? { ...e, grams: Number(grams) || 0 } : e)) }));
  }

  function deleteEntry(entryId) {
    setDays((prev) => ({ ...prev, [selectedDate]: (prev[selectedDate] || []).filter((e) => e.id !== entryId) }));
  }

  const swapOptions = useMemo(() => {
    if (!swapEntry) return [];
    const currentFood = foods.find((f) => f.id === swapEntry.foodId);
    const targetCarbs = calcEntry(currentFood, swapEntry.grams).carbs;
    return foods
      .filter((f) => f.id !== swapEntry.foodId && f.carbs > 0)
      .map((f) => {
        const neededGrams = round1((targetCarbs / f.carbs) * 100);
        return { ...f, neededGrams, macros: calcEntry(f, neededGrams) };
      })
      .sort((a, b) => a.neededGrams - b.neededGrams);
  }, [swapEntry, foods]);

  function exportBackup() {
    const data = { foods, days, mealTargets, dailyTargets, dailyTargetAuto, macroPercents };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosa-mangio-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.foods) setFoods(data.foods);
        if (data.days) setDays(data.days);
        if (data.mealTargets) setMealTargets({ ...defaultMealTargets, ...data.mealTargets });
        if (data.dailyTargets) setDailyTargets({ ...defaultDailyTargets, ...data.dailyTargets });
        if (typeof data.dailyTargetAuto === 'boolean') setDailyTargetAuto(data.dailyTargetAuto);
        if (data.macroPercents) setMacroPercents({ ...defaultMacroPercents, ...data.macroPercents });
        alert('✅ Backup importato con successo!');
      } catch {
        alert('❌ File non valido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function mergeBackup(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const theirFoods = data.foods || [];
        const theirDays = data.days || {};

        const foodIdMap = {};
        const newFoodsToAdd = [];

        theirFoods.forEach((tf) => {
          const nameLower = tf.name.trim().toLowerCase();
          const existing = foods.find((f) => f.name.trim().toLowerCase() === nameLower);
          if (existing) {
            foodIdMap[tf.id] = existing.id;
          } else {
            const newId = uid();
            foodIdMap[tf.id] = newId;
            newFoodsToAdd.push({ ...tf, id: newId });
          }
        });

        setFoods((prev) => [...prev, ...newFoodsToAdd]);

        setDays((prevDays) => {
          const merged = { ...prevDays };
          Object.entries(theirDays).forEach(([date, theirEntries]) => {
            const localEntries = merged[date] || [];
            const toAdd = [];
            theirEntries.forEach((te) => {
              const mappedFoodId = foodIdMap[te.foodId];
              if (!mappedFoodId) return;
              const alreadyExists = localEntries.some(
                (le) => le.foodId === mappedFoodId && le.meal === te.meal
              );
              if (!alreadyExists) {
                toAdd.push({ ...te, id: uid(), foodId: mappedFoodId });
              }
            });
            if (toAdd.length > 0) {
              merged[date] = [...localEntries, ...toAdd];
            }
          });
          return merged;
        });

        alert(`✅ Merge completato!\n+${newFoodsToAdd.length} nuovi alimenti aggiunti.`);
      } catch {
        alert('❌ File non valido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function applySwap(food) {
    if (!swapEntry) return;
    setDays((prev) => ({ ...prev, [selectedDate]: (prev[selectedDate] || []).map((e) => (e.id === swapEntry.id ? { ...e, foodId: food.id, grams: food.neededGrams } : e)) }));
    setSwapEntry(null);
  }

  const monthLabel = new Date(`${calendarMonth}-01`).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  function recipeCircleStyle(recipe) {
    if (!recipe?.isRecipe || !Array.isArray(recipe.ingredients)) return {};
    const totalRecipeWeight = recipe.recipeTotalWeight || recipe.ingredients.reduce((s, i) => s + (Number(i.grams) || 0), 0) || 1;
    const parts = [];
    recipe.ingredients.forEach((ing) => {
      const grams = Number(ing.grams) || 0;
      const share = Math.max(0, Math.min(100, (grams / totalRecipeWeight) * 100));
      const usage = weeklyIngredientUsage[ing.foodId];
      const color = usage?.level?.color || '#ffffff';
      if (share > 0) parts.push({ share, color });
    });
    let start = 0;
    const segs = parts.map((p) => {
      const end = start + p.share;
      const s = `${p.color} ${start}% ${end}%`;
      start = end;
      return s;
    });
    if (start < 100) segs.push(`#ffffff ${start}% 100%`);
    return {
      background: `conic-gradient(${segs.join(', ')})`,
      boxShadow: '0 0 0 2px white, 0 0 0 3px #334155',
    };
  }

  function recipeWarningText(recipe) {
    if (!recipe?.isRecipe || !Array.isArray(recipe.ingredients)) return '';
    const risky = recipe.ingredients
      .map((ing) => {
        const usage = weeklyIngredientUsage[ing.foodId];
        if (!usage || usage.portions < 4) return null;
        return `${ing.name}: ${usage.portions} porz.`;
      })
      .filter(Boolean);
    return risky.length ? risky.join(' · ') : '';
  }

  return (
    <div className="min-h-screen bg-slate-100 p-2 pb-24 text-slate-900 sm:p-4">
      <div className="mx-auto grid max-w-7xl gap-3 sm:gap-4 lg:grid-cols-[380px_1fr_420px]">
        <section className="rounded-2xl bg-white p-3 shadow sm:p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">🍝 Cosa mangio</h1>
            <div className="flex gap-1">
              <button onClick={exportBackup} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200" title="Esporta backup JSON">💾 Export</button>
              <label className="cursor-pointer rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200" title="Importa backup JSON (sovrascrive tutto)">
                📂 Import
                <input type="file" accept=".json" className="hidden" onChange={importBackup} />
              </label>
              <label className="cursor-pointer rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200" title="Unisci con backup di un'altra persona (non sovrascrive)">
                🔀 Merge
                <input type="file" accept=".json" className="hidden" onChange={mergeBackup} />
              </label>
            </div>
          </div>
          <div className="mt-1 text-sm text-slate-500">Libreria ingredienti</div>

          <input className="mt-3 w-full rounded-xl border p-3" placeholder="Cerca nei tuoi prodotti" value={search} onChange={(e) => setSearch(e.target.value)} />

          <div className="mt-4 grid grid-cols-2 gap-2">
            <input className="col-span-2 rounded-xl border p-2" placeholder="Nome" value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} />
            <label className="text-sm font-semibold">Carboidrati /100g<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={foodForm.carbs} onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })} /></label>
            <label className="text-sm font-semibold">Proteine /100g<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={foodForm.protein} onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })} /></label>
            <label className="text-sm font-semibold">Grassi /100g<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={foodForm.fat} onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })} /></label>
            <label className="text-sm font-semibold">Kcal /100g<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={foodForm.kcal} onChange={(e) => setFoodForm({ ...foodForm, kcal: e.target.value })} /></label>
            <label className="col-span-2 text-sm font-semibold">Porzione normale (g)
              <input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" placeholder="es. pasta 80g, pane 50g" value={foodForm.portionSize} onChange={(e) => setFoodForm({ ...foodForm, portionSize: e.target.value })} />
            </label>
            <label className="col-span-2 text-sm font-semibold">Tipo carboidrati
              <select className="mt-1 w-full rounded-xl border p-2 font-normal" value={foodForm.carbSpeed} onChange={(e) => setFoodForm({ ...foodForm, carbSpeed: e.target.value })}>
                {carbSpeedOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={saveFood} className="rounded-xl bg-black p-3 font-semibold text-white">{editingFoodId ? 'Salva modifica' : '+ Aggiungi'}</button>
            <button onClick={() => setShowRecipeCreator(true)} className="rounded-xl bg-amber-500 p-3 font-semibold text-white">+ Ricetta</button>
          </div>

          <div className="mt-4 rounded-2xl border bg-slate-50 p-3">
            <div className="font-bold">Libreria pubblica</div>
            <div className="text-xs text-slate-500">🏛️ ufficiale/base · 🌍⚠️ controlla etichetta</div>
            <input className="mt-2 w-full rounded-xl border p-2" placeholder="Cerca alimenti pubblici" value={publicSearch} onChange={(e) => setPublicSearch(e.target.value)} />
            <div className="mt-2 max-h-[220px] space-y-2 overflow-auto">
              {filteredPublicFoods.map((food) => {
                const sm = foodSourceMeta(food);
                const exists = foods.some((f) => f.publicId === food.id || f.name.toLowerCase() === food.name.toLowerCase());
                return (
                  <div key={food.id} className="rounded-xl border bg-white p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{sm.icon} {food.name} <span className={`${carbSpeedMeta(food.carbSpeed).color}`}>{carbSpeedMeta(food.carbSpeed).icon}</span></div>
                        <div className="text-xs text-slate-500">Carboidrati: {food.carbs}g | Proteine: {food.protein}g | Grassi: {food.fat}g | Kcal: {food.kcal}</div>
                      </div>
                      <button disabled={exists} onClick={() => importPublicFood(food)} className="rounded-lg bg-green-600 px-2 py-1 text-xs text-white disabled:bg-slate-300">{exists ? 'Già' : 'Importa'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 max-h-[520px] space-y-2 overflow-auto">
            {filteredFoods.map((food) => {
              const sm = foodSourceMeta(food);
              return (
                <div key={food.id} className="rounded-xl border p-3">
                  <div className="flex justify-between gap-2">
                    <div>
                      <div className="font-bold">{food.name} <span className={`ml-1 ${carbSpeedMeta(food.carbSpeed).color}`}>{carbSpeedMeta(food.carbSpeed).icon}</span>
                        {food.isRecipe && (
                          <span
                            className="ml-2 inline-block h-7 w-7 rounded-full border-2 border-slate-700 align-middle"
                            style={recipeCircleStyle(food)}
                            title="Stato ingredienti ricetta nella settimana"
                          />
                        )}
                      </div>
                      <div className="mt-1"><span className={`rounded-full px-2 py-1 text-[11px] ${sm.color}`}>{sm.icon} {sm.label}</span></div>
                      <div className="mt-1 text-xs text-slate-500">Carboidrati: {food.carbs}g | Proteine: {food.protein}g | Grassi: {food.fat}g | Kcal: {food.kcal}</div>
                      {weeklyIngredientUsage[food.id] && weeklyIngredientUsage[food.id].grams > 0 && (
                        <div className={`mt-2 inline-block rounded-full px-2 py-1 text-[11px] ${weeklyIngredientUsage[food.id].level.bg} ${weeklyIngredientUsage[food.id].level.text}`}>
                          Settimana: {weeklyIngredientUsage[food.id].grams}g · {weeklyIngredientUsage[food.id].portions} porz.
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => (food.isRecipe ? openRecipeEditor(food) : editFood(food))} className="rounded-lg bg-slate-200 px-2 py-1 text-sm">Edit</button>
                      <button onClick={() => deleteFood(food.id)} className="rounded-lg bg-red-100 px-2 py-1 text-sm text-red-700">X</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-3 shadow sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="grid w-full max-w-[320px] grid-cols-[44px_1fr_44px] items-center gap-2">
              <button onClick={() => moveMonth(-1)} className="h-11 rounded-xl bg-slate-200 px-3 py-2 font-bold">←</button>
              <h2 className="text-center text-lg font-bold capitalize sm:text-2xl">{monthLabel}</h2>
              <button onClick={() => moveMonth(1)} className="h-11 rounded-xl bg-slate-200 px-3 py-2 font-bold">→</button>
            </div>
            <button onClick={goToday} className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-sm text-white sm:px-4 sm:text-base">Oggi</button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 sm:gap-2 sm:text-sm">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="mt-2 grid min-h-[420px] grid-cols-7 grid-rows-6 gap-1 sm:min-h-[512px] sm:gap-2">
            {monthDays.map((d, i) => {
              if (!d) return <div key={i} className="min-h-[64px] rounded-xl sm:min-h-[76px] sm:rounded-2xl" />;
              const count = (days[d.key] || []).length;
              const active = selectedDate === d.key;
              const isToday = todayKey() === d.key;
              return (
                <button key={d.key} onClick={() => setSelectedDate(d.key)} className={`relative min-h-[64px] rounded-xl border p-1 text-left text-sm sm:min-h-[76px] sm:rounded-2xl sm:p-2 ${active ? 'bg-black text-white border-black' : isToday ? 'bg-blue-50 border-blue-500' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between font-bold"><span>{d.day}</span>{isToday && !active && <span className="rounded-full bg-blue-500 px-1 py-0.5 text-[9px] text-white sm:px-2">OGGI</span>}</div>
                  {count > 0 && <div className="mt-2 text-xs">{count} pasti</div>}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <div className="rounded-xl bg-slate-100 p-3"><b>{total.carbs}g</b><br />Carbo</div>
            <div className="rounded-xl bg-slate-100 p-3"><b>{total.protein}g</b><br />Proteine</div>
            <div className="rounded-xl bg-slate-100 p-3"><b>{total.fat}g</b><br />Grassi</div>
            <div className="rounded-xl bg-slate-100 p-3"><b>{total.kcal}</b><br />Kcal</div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <h3 className="mb-3 text-lg font-bold">Obiettivo totale giornaliero</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ['Carboidrati', total.carbs, effectiveDailyTargets.carbs, 'g'],
                ['Proteine', total.protein, effectiveDailyTargets.protein, 'g'],
                ['Grassi', total.fat, effectiveDailyTargets.fat, 'g'],
                ['Kcal', total.kcal, effectiveDailyTargets.kcal, 'kcal'],
              ].map(([label, current, target, unit]) => {
                const info = targetInfo(current, target);
                return (
                  <div key={label} className="rounded-xl bg-white p-3">
                    <div className="flex justify-between text-sm font-semibold"><span>{label}</span><span>{current}{unit === 'g' ? 'g' : ''} / {target || 0}{unit === 'g' ? 'g' : ' kcal'}</span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full ${info.done ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${info.percent}%` }} /></div>
                    <div className={`mt-1 text-xs ${info.done ? 'text-green-700' : 'text-slate-500'}`}>{info.text}{target ? (unit === 'g' ? 'g' : ' kcal') : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <h3 className="mb-3 text-lg font-bold">Percentuale macro giornata</h3>
            {pieData.length === 0 ? <div className="py-8 text-center text-slate-500">Aggiungi alimenti per vedere il grafico</div> : (
              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <div className="h-[180px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={80} paddingAngle={2}>{pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer></div>
                <div className="flex flex-col justify-center gap-2">
                  <div className="rounded-xl bg-white p-3"><b style={{ color: '#22c55e' }}>{macroPerc.carbs}%</b> Carboidrati</div>
                  <div className="rounded-xl bg-white p-3"><b style={{ color: '#3b82f6' }}>{macroPerc.protein}%</b> Proteine</div>
                  <div className="rounded-xl bg-white p-3"><b style={{ color: '#f97316' }}>{macroPerc.fat}%</b> Grassi</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-white p-3">
            <div className="font-bold">Controllo varietà settimana</div>
            {foods.filter((food) => !food.isRecipe && (weeklyIngredientUsage[food.id]?.portions || 0) >= 7).length === 0 ? (
              <div className="mt-1 text-sm text-slate-500">Nessun alimento troppo ripetuto questa settimana.</div>
            ) : (
              <div className="mt-2 space-y-1 text-sm">
                {foods
                  .filter((food) => !food.isRecipe && (weeklyIngredientUsage[food.id]?.portions || 0) >= 7)
                  .map((food) => {
                    const usage = weeklyIngredientUsage[food.id];
                    return (
                      <div key={food.id} className={`${usage.level.text}`}>
                        Questa settimana hai usato molto: <b>{food.name}</b> ({usage.portions} porz.)
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-3 shadow sm:p-4">
          <div className="flex items-center justify-between gap-2"><h2 className="text-2xl font-bold">Giornaliera</h2><button onClick={() => setShowMealTargets(true)} className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white">🎯 Obiettivi</button></div>
          <div className="mb-3 text-slate-500">{selectedDate} {selectedDate === todayKey() ? '· Oggi' : ''}</div>

          <div className="rounded-2xl border bg-slate-50 p-3">
            <select className="mb-2 w-full rounded-xl border p-3" value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)}>{mealTypes.map((meal) => <option key={meal} value={meal}>{meal}</option>)}</select>
            <select className="w-full rounded-xl border p-3" value={selectedFoodId} onChange={(e) => setSelectedFoodId(e.target.value)}>
              {foods.map((f) => {
                const usage = weeklyIngredientUsage[f.id];
                const portions = usage?.portions || 0;
                const mark =
                  portions >= 10 ? '🔴' :
                  portions >= 7 ? '🟠' :
                  portions >= 4 ? '🟢' :
                  '⚪';
                return (
                  <option key={f.id} value={f.id}>
                    {mark} {foodSourceMeta(f).icon} {carbSpeedMeta(f.carbSpeed).icon} {f.name}{portions > 0 ? ` (${portions} porz.)` : ''}{f.isRecipe ? ' (ricetta)' : ''}
                  </option>
                );
              })}
            </select>
            {selectedFood && selectedFood.isRecipe && (
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-amber-50 p-2 text-sm">
                <span
                  className="inline-block h-7 w-7 shrink-0 rounded-full border-2 border-slate-700"
                  style={recipeCircleStyle(selectedFood)}
                />
                <span>
                  Stato ricetta settimana
                  {recipeWarningText(selectedFood) && (
                    <span className="block text-xs text-orange-700">
                      {recipeWarningText(selectedFood)}
                    </span>
                  )}
                </span>
              </div>
            )}
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input className="rounded-xl border p-2" type="number" placeholder="Grammi" value={addGrams} onChange={(e) => setAddGrams(e.target.value)} />
              <input className="rounded-xl border p-2" type="number" placeholder="Oppure carbo target" value={addCarbs} onChange={(e) => setAddCarbs(e.target.value)} />
            </div>
            <button onClick={addEntry} className="mt-2 w-full rounded-xl bg-green-600 p-3 font-semibold text-white">Aggiungi alla giornata</button>
          </div>

          <div className="mt-4 max-h-[520px] space-y-4 overflow-auto">
            {entries.length === 0 && <div className="py-8 text-center text-slate-500">Nessun pasto in questo giorno</div>}
            {mealTypes.map((meal) => {
              const mealEntries = entries.filter((e) => (e.meal || 'Colazione') === meal);
              const mealCarbs = round1(mealEntries.reduce((sum, e) => sum + calcEntry(foods.find((f) => f.id === e.foodId), e.grams).carbs, 0));
              const target = Number(mealTargets[meal]) || 0;
              const diff = round1(target - mealCarbs);
              if (mealEntries.length === 0 && selectedMeal !== meal) return null;
              return (
                <div key={meal} className={`rounded-2xl border p-3 ${selectedMeal === meal ? 'border-green-500 bg-green-50' : 'bg-white'}`}>
                  <div className="mb-2 flex items-center justify-between gap-2"><div className="font-bold">{meal}</div><div className="text-xs text-slate-600">Carbo: {mealCarbs}g{target > 0 ? ` / ${target}g (${diff >= 0 ? 'mancano ' + diff : 'superato ' + Math.abs(diff)}g)` : ''}</div></div>
                  {mealEntries.length === 0 && <div className="text-sm text-slate-500">Aggiungi qui il cibo selezionato sopra.</div>}
                  <div className="space-y-3">
                    {mealEntries.map((entry) => {
                      const food = foods.find((f) => f.id === entry.foodId);
                      const m = calcEntry(food, entry.grams);
                      return (
                        <div key={entry.id} className="rounded-2xl border bg-white p-3">
                          <div className="flex justify-between gap-2">
                            <div>
                              <div className="font-bold">{entry.time} - {food?.name || 'Eliminato'} {food && <span className={`ml-1 ${carbSpeedMeta(food.carbSpeed).color}`}>{carbSpeedMeta(food.carbSpeed).icon}</span>} {food && <span className="ml-1">{foodSourceMeta(food).icon}</span>}</div>
                              <div className="text-sm text-slate-600">Carboidrati: {m.carbs}g | Proteine: {m.protein}g | Grassi: {m.fat}g | Kcal: {m.kcal}</div>
                            </div>
                            <button onClick={() => deleteEntry(entry.id)} className="rounded-lg bg-red-100 px-2 text-red-700">X</button>
                          </div>
                          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                            <input className="rounded-xl border p-2" type="number" value={entry.grams} onChange={(e) => updateEntryGrams(entry.id, e.target.value)} />
                            <div className="flex gap-2">{food?.isRecipe && <button onClick={() => setRecipeViewEntry(entry)} className="rounded-xl bg-amber-500 px-3 text-white">Ricetta</button>}<button onClick={() => setSwapEntry(entry)} className="rounded-xl bg-blue-600 px-4 text-white">Swap</button></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {showRecipeCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-xl font-bold">{editingRecipeId ? 'Modifica ricetta' : 'Crea ricetta'}</h3><button onClick={() => { setShowRecipeCreator(false); setEditingRecipeId(null); }} className="rounded-xl bg-slate-200 px-3 py-2">Chiudi</button></div>
          <input className="mb-2 w-full rounded-xl border p-3" placeholder="Nome ricetta" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} />
          <select className="mb-3 w-full rounded-xl border p-3" value={recipeSpeed} onChange={(e) => setRecipeSpeed(e.target.value)}>{carbSpeedOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>)}</select>
          <div className="space-y-2">{recipeRows.map((row) => <div key={row.id} className="grid grid-cols-[1fr_90px_36px] gap-2"><select className="rounded-xl border p-2" value={row.foodId} onChange={(e) => setRecipeRows((prev) => prev.map((r) => r.id === row.id ? { ...r, foodId: Number(e.target.value) } : r))}>{foods.filter((f) => !f.isRecipe).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select><input className="rounded-xl border p-2" type="number" placeholder="grammi" value={row.grams} onChange={(e) => setRecipeRows((prev) => prev.map((r) => r.id === row.id ? { ...r, grams: e.target.value } : r))} /><button className="rounded-xl bg-red-100 text-red-700" onClick={() => setRecipeRows((prev) => prev.filter((r) => r.id !== row.id))}>X</button></div>)}</div>
          <button className="mt-3 w-full rounded-xl bg-slate-200 p-3 font-semibold" onClick={() => setRecipeRows((prev) => [...prev, { id: uid(), foodId: foods.find((f) => !f.isRecipe)?.id || 1, grams: '' }])}>+ Aggiungi ingrediente</button>
          <button className="mt-2 w-full rounded-xl bg-amber-500 p-3 font-semibold text-white" onClick={createRecipe}>{editingRecipeId ? 'Salva modifica ricetta' : 'Crea ricetta'}</button>
        </div></div>
      )}

      {recipeViewEntry && (() => {
        const food = foods.find((f) => f.id === recipeViewEntry.foodId);
        const scaled = scaleRecipeIngredients(food, recipeViewEntry.grams);
        return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl"><div className="mb-3 flex items-center justify-between"><h3 className="text-xl font-bold">Ingredienti ricetta</h3><button onClick={() => setRecipeViewEntry(null)} className="rounded-xl bg-slate-200 px-3 py-2">Chiudi</button></div><div className="mb-3 text-sm text-slate-500">Per {recipeViewEntry.grams}g di {food?.name}</div><div className="space-y-2">{scaled.map((ing) => <div key={`${ing.foodId}-${ing.name}`} className="rounded-xl border p-3"><b>{ing.name}</b>: {ing.scaledGrams}g</div>)}</div></div></div>;
      })()}

      {showMealTargets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-xl font-bold">Obiettivi</h3><button onClick={() => setShowMealTargets(false)} className="rounded-xl bg-slate-200 px-3 py-2">Chiudi</button></div>
          <div className="mb-4 rounded-2xl bg-slate-50 p-3"><div className="mb-2 flex items-center justify-between gap-2"><div className="font-bold">Totale giornaliero</div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={dailyTargetAuto} onChange={(e) => setDailyTargetAuto(e.target.checked)} />Automatico</label></div><div className="mb-2 text-xs text-slate-500">Automatico = carboidrati dalla somma degli obiettivi dei pasti. Proteine, grassi e kcal vengono calcolati dalle percentuali sotto.</div>
            {dailyTargetAuto && <div className="mb-3 grid grid-cols-3 gap-2"><label className="text-sm font-semibold">% Carbo<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={macroPercents.carbs} onChange={(e) => setMacroPercents((prev) => ({ ...prev, carbs: Number(e.target.value) || 0 }))} /></label><label className="text-sm font-semibold">% Proteine<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={macroPercents.protein} onChange={(e) => setMacroPercents((prev) => ({ ...prev, protein: Number(e.target.value) || 0 }))} /></label><label className="text-sm font-semibold">% Grassi<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" value={macroPercents.fat} onChange={(e) => setMacroPercents((prev) => ({ ...prev, fat: Number(e.target.value) || 0 }))} /></label></div>}
            <div className="grid grid-cols-2 gap-2"><label className="text-sm font-semibold">Carboidrati<input className="mt-1 w-full rounded-xl border p-2 font-normal disabled:bg-slate-200" type="number" disabled={dailyTargetAuto} value={dailyTargetAuto ? effectiveDailyTargets.carbs : dailyTargets.carbs || ''} onChange={(e) => setDailyTargets((prev) => ({ ...prev, carbs: Number(e.target.value) || 0 }))} /></label><label className="text-sm font-semibold">Proteine<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" disabled={dailyTargetAuto} value={dailyTargetAuto ? effectiveDailyTargets.protein : dailyTargets.protein || ''} onChange={(e) => setDailyTargets((prev) => ({ ...prev, protein: Number(e.target.value) || 0 }))} /></label><label className="text-sm font-semibold">Grassi<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" disabled={dailyTargetAuto} value={dailyTargetAuto ? effectiveDailyTargets.fat : dailyTargets.fat || ''} onChange={(e) => setDailyTargets((prev) => ({ ...prev, fat: Number(e.target.value) || 0 }))} /></label><label className="text-sm font-semibold">Kcal<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" disabled={dailyTargetAuto} value={dailyTargetAuto ? effectiveDailyTargets.kcal : dailyTargets.kcal || ''} onChange={(e) => setDailyTargets((prev) => ({ ...prev, kcal: Number(e.target.value) || 0 }))} /></label></div>
          </div>
          <div className="mb-2 font-bold">Carboidrati per pasto</div><div className="space-y-2">{mealTypes.map((meal) => <label key={meal} className="block text-sm font-semibold">{meal}<input className="mt-1 w-full rounded-xl border p-2 font-normal" type="number" placeholder="Carboidrati target" value={mealTargets[meal] || ''} onChange={(e) => setMealTargets((prev) => ({ ...prev, [meal]: Number(e.target.value) || 0 }))} /></label>)}</div>
        </div></div>
      )}

      {swapEntry && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-4 shadow-xl"><div className="mb-3 flex items-center justify-between"><h3 className="text-xl font-bold">Sostituisci per stessi carboidrati</h3><button onClick={() => setSwapEntry(null)} className="rounded-xl bg-slate-200 px-3 py-2">Chiudi</button></div><div className="space-y-2">{swapOptions.map((food) => <button key={food.id} onClick={() => applySwap(food)} className="w-full rounded-2xl border p-3 text-left hover:bg-slate-100"><div className="font-bold">{foodSourceMeta(food).icon} {food.name} → {food.neededGrams}g <span className={carbSpeedMeta(food.carbSpeed).color}>{carbSpeedMeta(food.carbSpeed).icon}</span></div><div className="text-sm text-slate-500">Carboidrati: {food.macros.carbs}g | Proteine: {food.macros.protein}g | Grassi: {food.macros.fat}g | Kcal: {food.macros.kcal}</div></button>)}</div></div></div>
      )}
    </div>
  );
}
