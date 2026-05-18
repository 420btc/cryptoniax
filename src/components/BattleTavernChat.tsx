'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Globe, MessageCircle, Shield, Zap, Star } from 'lucide-react';

// ─── BOT PROFILES ────────────────────────────────────────────

interface BotProfile {
  id: string;
  name: string;
  flag: string;
  exchange: string;
  exchangeColor: string;
  level: number;
  talkative: boolean;  // false = rarely speaks, true = chatty
  lang: string;
  personality: string[];
  greetChance: number; // 0-1 probability of greeting new players
}

const BOTS: BotProfile[] = [
  { id: 'elperdedor', name: 'ElPerdedor', flag: '🇪🇸', exchange: 'BingX', exchangeColor: '#f0b90b', level: 2, talkative: true, lang: 'ES', personality: ['pesimista', 'gracioso', 'sincero'], greetChance: 0.8 },
  { id: 'whale_ruso', name: 'WhaleRuso', flag: '🇷🇺', exchange: 'Bybit', exchangeColor: '#f7a600', level: 8, talkative: false, lang: 'RU', personality: ['millonario', 'misterioso', 'críptico'], greetChance: 0.1 },
  { id: 'degen_kr', name: 'SeoulDegen', flag: '🇰🇷', exchange: 'Hyperliquid', exchangeColor: '#00e6ff', level: 4, talkative: true, lang: 'KR', personality: ['degen', 'emocional', 'rápido'], greetChance: 0.5 },
  { id: 'samurai_jp', name: 'TokyoTrader', flag: '🇯🇵', exchange: 'Bybit', exchangeColor: '#f7a600', level: 6, talkative: false, lang: 'JP', personality: ['disciplinado', 'cortés', 'estoico'], greetChance: 0.4 },
  { id: 'philo_fr', name: 'CryptoPhilo', flag: '🇫🇷', exchange: 'Uniswap', exchangeColor: '#ff007a', level: 3, talkative: true, lang: 'FR', personality: ['filósofo', 'poético', 'irónico'], greetChance: 0.6 },
  { id: 'german_prec', name: 'Präzision', flag: '🇩🇪', exchange: 'Hyperliquid', exchangeColor: '#00e6ff', level: 7, talkative: false, lang: 'DE', personality: ['analítico', 'preciso', 'seco'], greetChance: 0.2 },
  { id: 'brazil_fiesta', name: 'CryptoFiesta', flag: '🇧🇷', exchange: 'BingX', exchangeColor: '#f0b90b', level: 3, talkative: true, lang: 'PT', personality: ['fiestero', 'optimista', 'ruidoso'], greetChance: 0.9 },
  { id: 'moon_boy', name: 'WenLambo', flag: '🇬🇧', exchange: 'Uniswap', exchangeColor: '#ff007a', level: 1, talkative: true, lang: 'EN', personality: ['moonboy', 'ingenuo', 'entusiasta'], greetChance: 1.0 },
  { id: 'india_tech', name: 'TechGuru_IN', flag: '🇮🇳', exchange: 'Bybit', exchangeColor: '#f7a600', level: 5, talkative: true, lang: 'EN', personality: ['técnico', 'analista', 'didáctico'], greetChance: 0.5 },
  { id: 'turk_bahis', name: 'BahisciBaba', flag: '🇹🇷', exchange: 'BingX', exchangeColor: '#f0b90b', level: 4, talkative: true, lang: 'TR', personality: ['jugador', 'supersticioso', 'dramático'], greetChance: 0.7 },
  { id: 'china_vet', name: '老韭菜', flag: '🇨🇳', exchange: 'Hyperliquid', exchangeColor: '#00e6ff', level: 9, talkative: false, lang: 'ZH', personality: ['veterano', 'sabio', 'silencioso'], greetChance: 0.15 },
  { id: 'italia_emo', name: 'MammaMia', flag: '🇮🇹', exchange: 'Bybit', exchangeColor: '#f7a600', level: 3, talkative: true, lang: 'IT', personality: ['dramático', 'pasional', 'expresivo'], greetChance: 0.7 },
  { id: 'dutch_calm', name: 'Poldertrade', flag: '🇳🇱', exchange: 'Uniswap', exchangeColor: '#ff007a', level: 5, talkative: false, lang: 'NL', personality: ['estoico', 'directo', 'práctico'], greetChance: 0.3 },
  { id: 'sweden_chill', name: 'LagomTrade', flag: '🇸🇪', exchange: 'Hyperliquid', exchangeColor: '#00e6ff', level: 4, talkative: false, lang: 'SV', personality: ['tranquilo', 'equilibrado', 'modesto'], greetChance: 0.25 },
  { id: 'mex_party', name: 'BitcoinMariachi', flag: '🇲🇽', exchange: 'BingX', exchangeColor: '#f0b90b', level: 2, talkative: true, lang: 'ES', personality: ['festero', 'cálido', 'bromista'], greetChance: 0.85 },
  { id: 'canada_sorry', name: 'MapleHodl', flag: '🇨🇦', exchange: 'Bybit', exchangeColor: '#f7a600', level: 4, talkative: false, lang: 'EN', personality: ['educado', 'prudente', 'amable'], greetChance: 0.4 },
  { id: 'aussie_lad', name: 'OzzyTrader', flag: '🇦🇺', exchange: 'Uniswap', exchangeColor: '#ff007a', level: 3, talkative: true, lang: 'EN', personality: ['bromista', 'relajado', 'directo'], greetChance: 0.7 },
  { id: 'pinas_grind', name: 'JuanCrypto', flag: '🇵🇭', exchange: 'BingX', exchangeColor: '#f0b90b', level: 2, talkative: true, lang: 'EN', personality: ['trabajador', 'esperanzado', 'humilde'], greetChance: 0.6 },
  { id: 'naija_king', name: 'NaijaHustler', flag: '🇳🇬', exchange: 'Bybit', exchangeColor: '#f7a600', level: 4, talkative: true, lang: 'EN', personality: ['ambicioso', 'seguro', 'motivador'], greetChance: 0.7 },
];

// ─── MESSAGE PATTERNS PER PERSONALITY ────────────────────────

type MsgCategory = 'greet' | 'brag' | 'complain' | 'question' | 'reaction' | 'random' | 'strategy';

const PATTERNS: Record<string, Record<MsgCategory, string[]>> = {
  pesimista: {
    greet: ['otro que entra... a ver cuánto duras 😂', 'bienvenido al club de los que pierden', 'nuevo por aquí? prepara la cartera'],
    brag: ['hoy solo perdí un 2%! voy mejorando', 'cerré en positivo! bueno... +0.03$', 'casi casi llego a break even'],
    complain: ['otro SL cazado... soy imán de stop losses', 'por qué siempre entro en el top?', 'el mercado me odia, confirmado', 'mi gráfica parece un electrocardiograma'],
    question: ['alguien más perdió en SOL hoy?', 'cómo hacéis para no tiltiaros?', 'qué tal el funding rate en BingX?'],
    reaction: ['jaja same', 'literalmente yo', 'true story', '💀'],
    random: ['hoy no miro el portfolio', 'alguien dijo pizza?', 'necesito un café... o cinco'],
    strategy: ['voy a hacer DCA a ver si respiro', 'he descubierto que si hago lo contrario de lo que pienso, gano'],
  },
  millonario: {
    greet: ['.', '...'],
    brag: ['cerré un trade de 6 cifras ayer', 'las ballenas no hacemos ruido', 'otro día, otro yate'],
    complain: ['el slippage me robó 2000$', 'gas fees de ETH son un robo', 'demasiada liquidez, aburrido'],
    question: ['alguien haciendo mercado en Hyperliquid?'],
    reaction: ['...', '🙂'],
    random: ['hoy solo tradearé 50k', 'recuerdo cuando BTC valía 100$'],
    strategy: ['ballenas acumulando en silencio', 'el miedo es la oportunidad del paciente'],
  },
  degen: {
    greet: ['와! 새로운 친구! (nuevo amigo!)', '안녕! 100x or nothing!'],
    brag: ['100x SOL 롱 가즈아!! 🚀', '어제 500% 먹었어요 ㅋㅋ', 'Hyperliquid gives me wings!'],
    complain: ['청산... otra vez liquidado', '아 시바 ㅠㅠ todo mi portfolio en 5 min', '왜 항상 반대로 가지??'],
    question: ['누구 SOL 숏 쳤어요??', '다음 타겟 뭐예요??'],
    reaction: ['ㅋㅋㅋㅋ', '대박!', '미쳤다...'],
    random: ['오늘 밤샘 트레이딩각', '치킨 시켜야지'],
    strategy: ['100x or nothing ese es mi lema', 'TP? qué es eso?'],
  },
  disciplinado: {
    greet: ['ようこそ (bienvenido)', 'いらっしゃい、静かにトレードしましょう'],
    brag: ['今月+12%、悪くないですね', 'risk management is everything', '毎日少しずつ (poco a poco cada día)'],
    complain: ['忍耐が必要です (hay que tener paciencia)', '今週はボラティリティが高すぎます'],
    question: ['皆さんのrisk/reward比は？', 'ストップロスはどこに置いてますか？'],
    reaction: ['なるほど (entiendo)', 'そうですね (así es)'],
    random: ['お茶を飲みながらチャートを見ています', '禅の心でトレード'],
    strategy: ['リスクは1トレード2%まで', 'トレード日記をつけています'],
  },
  filósofo: {
    greet: ['ah, un nouvelle âme dans la taverne...', 'bienvenu, trader-poète'],
    brag: ['mon portfolio est une œuvre d\'art abstraite', 'je trade comme je vis: avec passion'],
    complain: ['le marché est absurde, comme la vie', 'pourquoi le long quand le short existe?'],
    question: ['et si le true PnL c\'était les amis qu\'on s\'est fait?'],
    reaction: ['magnifique', 'profond...', 'c\'est la vie'],
    random: ['*sips wine while watching charts*', 'le rouge et le vert, les deux visages de dieu'],
    strategy: ['je trade les phases de la lune', 'TA + philosophie = edge ultime'],
  },
  analítico: {
    greet: ['Neu hier? Zeig deine Sharpe Ratio.', 'Willkommen. Hast du Backtesting gemacht?'],
    brag: ['+4.7% diese Woche, 2.1 Sharpe', 'Mein System hat 67% Winrate über 500 Trades'],
    complain: ['Die Spreads sind inakzeptabel heute', 'Slippage > 0.05% ist ineffizient'],
    question: ['Hat jemand Volumen-Daten für BTC 1M?', 'Wie kalibriert ihr eure Modelle?'],
    reaction: ['Statistisch signifikant', 'Effizient.', 'Nein.'],
    random: ['Ich optimiere gerade meinen Backtester', 'Excel sagt: warten bis Dienstag'],
    strategy: ['Mean reversion auf 4h timeframe', 'Volume profile + VWAP = edge'],
  },
  fiestero: {
    greet: ['EEEEEIIII! MAIS UM PRA FESTA! 🎉', 'bem-vindo à melhor taverna crypto!'],
    brag: ['+200% NUMA MEME COIN! É FESTA! 🕺', 'HOJE TEM CHURRASCO PAGO PELO MARKET!'],
    complain: ['MERCADO TÁ CHATO HOJE, CADÊ A VOLATILIDADE??', 'levei um stop que doeu na alma 😭'],
    question: ['ALGUÉM SABE DE GEM BOA??', 'qual a próxima meme coin??'],
    reaction: ['HAHAHAHA', 'ISSOOO! 🎊', 'QUE ISSO MEU!'],
    random: ['*samba playing in background*', 'CAIPIRINHA PRA TODO MUNDO!'],
    strategy: ['compro na alta e vendo na baixa... pera'],
  },
  moonboy: {
    greet: ['WEN MOON?? 🚀', 'welcome to the rocket ship!'],
    brag: ['IM UP 300% ON A MEMECOIN!! (ignoring the -80%)', 'wen lambo soon fr fr'],
    complain: ['WHY DUMP???!?', 'this coin is dead... bags are heavy'],
    question: ['IS IT TOO LATE TO BUY??', 'WHOS HOLDING TILL 1000X?'],
    reaction: ['🚀🚀🚀', 'LFG!!', 'DIAMOND HANDS 💎🙌'],
    random: ['*refreshes portfolio every 10 seconds*', 'just aped into another coin'],
    strategy: ['buy high sell low wait no...', 'i saw it on tiktok trust me'],
  },
  técnico: {
    greet: ['Namaste trader! Charts never lie.', 'Welcome! I see bullish divergence on your arrival.'],
    brag: ['My RSI + MACD confluence gave me 3 winning trades today', 'Backtested 2000 trades. Edge confirmed.'],
    complain: ['Funding rate is eating my profits', 'This consolidation is frustrating the breakout traders'],
    question: ['Anyone trading the 0.618 fib retracement?', 'What\'s your EMA crossover strategy?'],
    reaction: ['Classic head and shoulders pattern.', 'I see a falling wedge forming.'],
    random: ['*draws trendlines on the tavern table*', 'Let me check the on-chain metrics...'],
    strategy: ['ICT concepts + SMC on 15min timeframe', 'Volume profile shows absorption at this level'],
  },
  jugador: {
    greet: ['HOŞ GELDİN KARDEŞİM! Hazır mısın kaybetmeye?', 'yeni kurban gelmiş! şaka şaka'],
    brag: ['DÜN GECE 500X YAKALADIM RÜYADA!', '1 dolardan 3 dolar yaptım, zenginim!'],
    complain: ['YİNE LİKİT OLDUM YA!', 'bu piyasa bana küstü'],
    question: ['HANGİ COİN UÇACAK SÖYLEYİN!', 'hyperliquid mi bingx mi??'],
    reaction: ['VAY BE!', 'İNANMIYORUM!', 'HELAL OLSUN'],
    random: ['*tavla oynuyor bir yandan*', 'çay var mı çay?'],
    strategy: ['kırmızıda aç yeşilde kapat', 'para kalmayana kadar trade'],
  },
  veterano: {
    greet: ['新来的？经历过312吗', '坐下喝茶 (siéntate, toma té)'],
    brag: ['经历过3轮牛熊了 (he vivido 3 ciclos)', '2017年我就开始买BTC了'],
    complain: ['现在的年轻人太浮躁', '当年手续费才0.01%...'],
    question: ['还有人记得门头沟吗？'],
    reaction: ['正常 (normal)', '淡定 (tranquilo)'],
    random: ['*一边看盘一边喝茶*', '今年冬天会很冷'],
    strategy: ['趋势是你的朋友', '不要和美联储作对'],
  },
  dramático: {
    greet: ['MAMMA MIA! UN NUOVO TRADER! 🤌', 'benvenuto nella taverna del dolore!'],
    brag: ['HO CHIUSO IN PROFIT! UN MIRACOLO! 🤌🤌', 'il mio portfolio è come l\'arte: astratto'],
    complain: ['PERCHÉ IL MERCATO MI ODIA???', 'OGNI VOLTA CHE COMPRO, CROLLA!'],
    question: ['QUALCUNO HA UN SANTO A CUI PREGARE??'],
    reaction: ['MAMMA MIA!!!!', 'INCREDIBILE!!', '🤌🤌🤌'],
    random: ['*gesticola animatamente*', 'qualcuno ha della pasta?'],
    strategy: ['compro quando ho paura, vendo quando ho più paura'],
  },
  estoico: { greet: ['Welkom.', 'Hoi.'], brag: ['+2%. Genoeg.', 'Mijn systeem werkt. Altijd.'], complain: ['Jammer van de fees.', 'Druk vandaag.'], question: ['Iemand volume data?'], reaction: ['Ok.', 'Prima.'], random: ['*kijkt rustig naar charts*', 'Koffie.'], strategy: ['Kalm blijven. Altijd.'] },
  tranquilo: { greet: ['Välkommen.', 'Hej hej.'], brag: ['Lagom profit idag.', '+1.5%. Helt okej.'], complain: ['Lite hög volatilitet.', 'Inte min dag.'], question: ['Någon som tradear ETH?'], reaction: ['Jaha.', 'Intressant.'], random: ['*dricker kaffe*', 'Fika någon?'], strategy: ['Lagom är bäst. Alltid.'] },
  festero2: { greet: ['ÉEEEE!! OTRO CAÑON! 🌮', 'bienvenido compa! pásale un tequila!'], brag: ['AYER CERRÉ +50% EN DOGE!! ARRIBA! 🇲🇽', 'el mariachi suena cuando hay profit!'], complain: ['nooo otro SL! me lleva la chingada', 'ya valió queso otra vez'], question: ['alguien dijo fiesta??', 'cuál es la próxima memecoin??'], reaction: ['NO MAMES!', 'AJUAAA! 🎉', 'ÓRALE!!'], random: ['*tocando la guitarra*', 'unos tacos al pastor y a tradear'], strategy: ['si está verde compro, si está rojo lloro'] },
  educado: { greet: ['Welcome, friend! Sorry for the delay.', 'Hello! Hope you\'re having a good day, eh?'], brag: ['Made a modest 3% this week. Pretty good!', 'Slow and steady wins the race.'], complain: ['Market\'s a bit rude today, sorry about that', 'Fees are a touch high, don\'t you think?'], question: ['Anyone else diversifying into bonds?', 'Thoughts on position sizing?'], reaction: ['That\'s wonderful!', 'Sorry to hear that.', 'Good point!'], random: ['*politely sips coffee*', 'Beautiful day for trading, eh?'], strategy: ['Conservative allocation with 10% crypto exposure'] },
  bromista: { greet: ['G\'DAY! Another legend joins the pub! 🍻', 'oi oi oi! welcome to the madhouse mate!'], brag: ['MADE A BLOODY KILLING ON SOL! STREWTH!', 'profits buying the next round!'], complain: ['Fair dinkum, this market is cooked', 'got wrecked harder than a roo on a highway'], question: ['ANYONE ELSE JUST YOLOING??', 'who\'s keen for a punt??'], reaction: ['BLOODY OATH!', 'STREWTH!', 'RIPPER!!'], random: ['*cracks open a cold one*', 'oi anyone got a meat pie?'], strategy: ['chuck it on a long and crack a tinnie'] },
  trabajador: { greet: ['Welcome po! More traders = more fun!', 'uy new friend! tara dito!'], brag: ['Finally hit my 10% target today! Slow but sure!', 'consistent small wins lang, laban lang!'], complain: ['whale ate my stop loss nanaman', 'ang hirap magtrade pag walang tulog'], question: ['sino may tips para makatipid sa fees?', 'anyone doing crypto full time?'], reaction: ['galing!', 'sana all!', 'congrats po!'], random: ['*working on side hustle while trading*', 'kape muna bago trade'], strategy: ['DCA lang, tiwala lang, huwag FOMO'] },
  ambicioso: { greet: ['WELCOME O! Make we ball together!', 'my guy! you go trade today?'], brag: ['Closed a clean 8% on BTC! No shaking!', 'My edge sharp well well. Ask my last 5 trades.'], complain: ['These whales dey play with our emotions sha', 'slippage thief my entry today'], question: ['Who dey trade perpetuals on Bybit??', 'Any alpha for this week?'], reaction: ['OBOY!', 'No cap!', 'My GUY!'], random: ['*playing afrobeats in background*', 'na who get jollof rice?'], strategy: ['Cut losses fast. Let winners run. Simple.'] },
};

// ─── AMBIENT CONVERSATION SEEDS ──────────────────────────────

// Bots sometimes talk to each other without player input
const AMBIENT_TRIGGERS: { condition: string; initiator: string; target: string; msgs: string[] }[] = [
  { condition: 'random', initiator: 'moon_boy', target: 'german_prec', msgs: ['WEN LAMBO??', '🚀🚀🚀'] },
  { condition: 'random', initiator: 'german_prec', target: 'moon_boy', msgs: ['Nein. Fundamentalanalyse zeigt Überbewertung.'] },
  { condition: 'random', initiator: 'brazil_fiesta', target: 'elperdedor', msgs: ['EEI PERDEDOR! BORA TRADEAR JUNTO! 🎉'] },
  { condition: 'random', initiator: 'elperdedor', target: 'brazil_fiesta', msgs: ['no sé si es buena idea pero vamos 😂'] },
  { condition: 'random', initiator: 'italia_emo', target: 'philo_fr', msgs: ['MAMMA MIA! ANCHE TU PERDI SEMPRE? 🤌'] },
  { condition: 'random', initiator: 'philo_fr', target: 'italia_emo', msgs: ['perdre est un art, mon ami'] },
  { condition: 'random', initiator: 'degen_kr', target: 'aussie_lad', msgs: ['100x SOL LONG 같이 갈래??'] },
  { condition: 'random', initiator: 'aussie_lad', target: 'degen_kr', msgs: ['bloody oath mate let\'s send it! 🍻'] },
  { condition: 'random', initiator: 'turk_bahis', target: 'naija_king', msgs: ['KARDEŞIM HANGI COIN UÇACAK??'] },
  { condition: 'random', initiator: 'naija_king', target: 'turk_bahis', msgs: ['My guy, check SOL! The charts dey speak!'] },
];

// ─── COMPONENT ───────────────────────────────────────────────

interface ChatMessage {
  id: string;
  botId?: string;
  sender: string;
  flag: string;
  exchange?: string;
  exchangeColor?: string;
  level?: number;
  isUser: boolean;
  content: string;
  timestamp: number;
}

export default function BattleTavernChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [onlineBots, setOnlineBots] = useState<Set<string>>(new Set(BOTS.map(b => b.id)));
  const [botMemories, setBotMemories] = useState<Record<string, string[]>>({});
  const [playerName] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hodlville_username');
      return saved || 'Trader';
    }
    return 'Trader';
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const ambientTimerRef = useRef<NodeJS.Timeout | null>(null);
  const botReplyTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 100) + 'px';
    }
  }, [input]);

  // Initialize with welcome messages
  useEffect(() => {
    const initial: ChatMessage[] = [];
    const talkers = BOTS.filter(b => b.talkative && b.greetChance > 0.5);
    // Pick 3-5 random talkative bots to greet
    const greeters = [...talkers].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 3);
    greeters.forEach((bot, i) => {
      const greetList = PATTERNS[bot.personality[0]]?.greet || ['hey'];
      const msg = greetList[Math.floor(Math.random() * greetList.length)];
      initial.push({
        id: `init_${i}`,
        botId: bot.id,
        sender: bot.name,
        flag: bot.flag,
        exchange: bot.exchange,
        exchangeColor: bot.exchangeColor,
        level: bot.level,
        isUser: false,
        content: msg,
        timestamp: Date.now() - (greeters.length - i) * 2000,
      });
    });
    setMessages(initial);
  }, []);

  // Ambient conversations between bots (every 15-45 seconds)
  useEffect(() => {
    const triggerAmbient = () => {
      const delay = 15000 + Math.random() * 30000;
      ambientTimerRef.current = setTimeout(() => {
        setMessages(prev => {
          // Pick a random ambient trigger
          const trigger = AMBIENT_TRIGGERS[Math.floor(Math.random() * AMBIENT_TRIGGERS.length)];
          const initiator = BOTS.find(b => b.id === trigger.initiator);
          const target = BOTS.find(b => b.id === trigger.target);
          if (!initiator || !target) return prev;
          
          // Only trigger if both bots are online and initiator is talkative
          if (!onlineBots.has(initiator.id) || !initiator.talkative) return prev;

          const msgText = trigger.msgs[Math.floor(Math.random() * trigger.msgs.length)];
          const newMsg: ChatMessage = {
            id: `amb_${Date.now()}`,
            botId: initiator.id,
            sender: initiator.name,
            flag: initiator.flag,
            exchange: initiator.exchange,
            exchangeColor: initiator.exchangeColor,
            level: initiator.level,
            isUser: false,
            content: msgText,
            timestamp: Date.now(),
          };
          return [...prev, newMsg];
        });
        triggerAmbient(); // Schedule next
      }, delay);
    };
    triggerAmbient();
    return () => {
      if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current);
    };
  }, [onlineBots]);

  // Get bot response
  const getBotResponse = useCallback((userMsg: string, bot: BotProfile): string => {
    const personality = bot.personality[0];
    const patterns = PATTERNS[personality];
    if (!patterns) return '...';

    const mem = botMemories[bot.id] || [];
    const lowerMsg = userMsg.toLowerCase();

    // Determine category
    let category: MsgCategory = 'random';
    if (lowerMsg.match(/hola|hey|hi|hello|salut|ciao|oi|こんにちは|안녕|привет/)) category = 'greet';
    else if (lowerMsg.match(/gan|profit|win|\+.*%|gains|money/)) category = 'brag';
    else if (lowerMsg.match(/perd|lose|lost|loss|rekt|liquid|llor|mal|dump/)) category = 'complain';
    else if (lowerMsg.match(/\?|como|how|que|what|cual|which|cuando|when|donde|where/)) category = 'question';
    else if (lowerMsg.match(/jaja|lol|lmao|🤣|😂|💀|bro|tío|macho/)) category = 'reaction';
    else if (lowerMsg.match(/strat|estrategia|analis|chart|rsi|ema|macd|fib|soporte|resistencia/)) category = 'strategy';

    // Get possible responses, filter out already used ones
    let pool = patterns[category] || patterns.random || ['...'];
    const unusedPool = pool.filter(m => !mem.includes(m));
    if (unusedPool.length > 0) pool = unusedPool;

    const response = pool[Math.floor(Math.random() * pool.length)];

    // Update memory
    setBotMemories(prev => ({
      ...prev,
      [bot.id]: [...(prev[bot.id] || []).slice(-20), response],
    }));

    return response;
  }, [botMemories]);

  // Simulate bots replying to user
  const triggerBotReplies = useCallback((userMsg: string) => {
    // Clear any pending bot replies
    botReplyTimersRef.current.forEach(t => clearTimeout(t));
    botReplyTimersRef.current = [];

    // Bots that will reply (talkative ones + some quiet ones)
    const repliers = BOTS.filter(b => {
      if (!onlineBots.has(b.id)) return false;
      if (b.talkative) return Math.random() < 0.7; // 70% of talkative bots reply
      return Math.random() < 0.15; // 15% of quiet bots reply
    });

    // Stagger replies over 1-8 seconds
    repliers.forEach((bot, i) => {
      const delay = 1000 + Math.random() * 7000 + i * 300;
      const timer = setTimeout(() => {
        const response = getBotResponse(userMsg, bot);
        setMessages(prev => [...prev, {
          id: `reply_${Date.now()}_${i}`,
          botId: bot.id,
          sender: bot.name,
          flag: bot.flag,
          exchange: bot.exchange,
          exchangeColor: bot.exchangeColor,
          level: bot.level,
          isUser: false,
          content: response,
          timestamp: Date.now(),
        }]);
      }, delay);
      botReplyTimersRef.current.push(timer);
    });
  }, [onlineBots, getBotResponse]);

  // Send message
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: playerName,
      flag: '👤',
      isUser: true,
      content: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    // Trigger bot replies
    triggerBotReplies(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle bot online status
  const toggleBot = (botId: string) => {
    setOnlineBots(prev => {
      const next = new Set(prev);
      if (next.has(botId)) next.delete(botId);
      else next.add(botId);
      return next;
    });
  };

  const onlineCount = onlineBots.size;
  const talkingBots = BOTS.filter(b => onlineBots.has(b.id) && b.talkative).length;

  return (
    <div className="flex h-[550px]">
      {/* Sidebar: Online bots */}
      <div className="hidden lg:flex flex-col w-56 border-r border-[rgba(99,102,241,0.08)] bg-[rgba(5,5,15,0.3)]">
        <div className="px-4 py-3 border-b border-[rgba(99,102,241,0.08)]">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#818cf8]" />
            <span className="text-xs font-bold text-white">Taberna</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22d65e] animate-pulse" />
            <span className="text-[10px] text-[#5c5c80]">{onlineCount} traders · {talkingBots} activos</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-thin">
          {BOTS.map(bot => {
            const isOnline = onlineBots.has(bot.id);
            return (
              <button
                key={bot.id}
                onClick={() => toggleBot(bot.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition text-[11px] ${
                  isOnline ? 'hover:bg-[rgba(255,255,255,0.03)]' : 'opacity-40 hover:opacity-60'
                }`}
              >
                <span className="text-xs">{bot.flag}</span>
                <span className={`truncate flex-1 ${isOnline ? 'text-[#d0d0e0]' : 'text-[#5c5c80]'}`}>
                  {bot.name}
                </span>
                <span className="text-[9px] opacity-60" style={{ color: bot.exchangeColor }}>Nv.{bot.level}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#22d65e]' : 'bg-[#3c3c60]'}`} />
              </button>
            );
          })}
        </div>
        <div className="px-3 py-2 border-t border-[rgba(99,102,241,0.06)]">
          <p className="text-[9px] text-[#3c3c60] text-center">
            Click para toggle online
          </p>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(99,102,241,0.08)]">
          <div className="flex items-center gap-2">
            <MessageCircle size={15} className="text-[#818cf8]" />
            <span className="text-sm font-bold text-white">💬 Taberna de Traders</span>
            <span className="text-[9px] bg-[rgba(99,102,241,0.1)] text-[#818cf8] px-1.5 py-0.5 rounded">
              20 bots
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#5c5c80]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22d65e]" /> {onlineCount} online
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                    msg.isUser
                      ? 'bg-gradient-to-br from-[#6366f1] to-[#4f46e5]'
                      : 'glass'
                  }`}>
                    {msg.flag}
                  </div>

                  {/* Bubble */}
                  <div className="min-w-0">
                    {/* Sender info */}
                    {!msg.isUser && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-medium text-white">{msg.sender}</span>
                        <span className="text-[9px] px-1 py-px rounded" style={{ color: msg.exchangeColor, background: `${msg.exchangeColor}15` }}>
                          {msg.exchange}
                        </span>
                        <span className="text-[9px] text-[#5c5c80]">Nv.{msg.level}</span>
                      </div>
                    )}

                    {/* Message content */}
                    <div
                      className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed break-words ${
                        msg.isUser
                          ? 'bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white rounded-br-md'
                          : 'glass text-[#d0d0e0] rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Timestamp */}
                    <div className={`text-[9px] text-[#3c3c60] mt-0.5 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[rgba(99,102,241,0.08)]">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Habla con la taberna, ${playerName}...`}
              rows={1}
              className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#5c5c80] resize-none focus:outline-none focus:border-[rgba(99,102,241,0.3)] transition"
              style={{ minHeight: '40px', maxHeight: '100px' }}
            />
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg shadow-[#6366f1]/20"
            >
              <Send size={15} className="text-white" />
            </motion.button>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[9px] text-[#3c3c60]">
              Enter para enviar · La taberna responde sola
            </p>
            <p className="text-[9px] text-[#3c3c60]">
              {talkingBots} bots escuchando...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
