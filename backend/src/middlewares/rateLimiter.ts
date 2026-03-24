import rateLimit from 'express-rate-limit';

// Limite geral para todas as rotas 
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limite para rotas que consultam a BRAPI pra evita esgotar a cota da API externa
export const brapiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10,
    message: { error: 'Limite de consultas à BRAPI atingido. Tente novamente em 1 minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limite para rotas de escrita (POST) — evita cadastros em massa
export const writeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 20,
    message: { error: 'Muitas operações em pouco tempo. Tente novamente em 1 minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
});