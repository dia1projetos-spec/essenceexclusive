// ============================================
// API MICORREO - CORREO ARGENTINO
// Cotización Real de Envíos
// ============================================

const MICORREO_CONFIG = {
    // URLs da API
    baseURL: {
        test: 'https://apitest.correoargentino.com.ar/micorreo/v1',
        prod: 'https://api.correoargentino.com.ar/micorreo/v1'
    },
    
    // Usar ambiente TEST por padrão até ter credenciais de produção
    environment: 'test',
    
    // Credenciais (solicitar ao Correo Argentino)
    // IMPORTANTE: Em produção, essas credenciais devem estar no BACKEND
    // Nunca exponha credenciais no frontend!
    credentials: {
        user: 'SEU_USER',        // Solicitar ao Correo
        password: 'SEU_PASSWORD', // Solicitar ao Correo
        customerId: 'SEU_CUSTOMER_ID' // Seu ID de cliente
    },
    
    // Configuração de origem (sua loja em Córdoba)
    origin: {
        postalCode: '5127',
        city: 'Córdoba',
        province: 'X',
        provinceName: 'Córdoba'
    },
    
    // Configuração de cache de token
    tokenCache: {
        token: null,
        expiresAt: null
    }
};

// Token JWT para autenticação
let authToken = null;
let tokenExpiration = null;

// ============================================
// AUTENTICAÇÃO
// ============================================

async function getAuthToken() {
    // Se já tem token válido, retornar
    if (authToken && tokenExpiration && new Date() < tokenExpiration) {
        return authToken;
    }
    
    const baseURL = MICORREO_CONFIG.baseURL[MICORREO_CONFIG.environment];
    const credentials = btoa(`${MICORREO_CONFIG.credentials.user}:${MICORREO_CONFIG.credentials.password}`);
    
    try {
        const response = await fetch(`${baseURL}/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha na autenticação');
        }
        
        const data = await response.json();
        authToken = data.token;
        tokenExpiration = new Date(data.expires);
        
        return authToken;
    } catch (error) {
        console.error('Erro ao obter token:', error);
        throw error;
    }
}

// ============================================
// COTIZAR ENVÍO - API REAL
// ============================================

async function cotizarEnvioMiCorreo(destinationPostalCode, weight, dimensions, deliveryType = null) {
    try {
        const token = await getAuthToken();
        const baseURL = MICORREO_CONFIG.baseURL[MICORREO_CONFIG.environment];
        
        const requestBody = {
            customerId: MICORREO_CONFIG.credentials.customerId,
            postalCodeOrigin: MICORREO_CONFIG.origin.postalCode,
            postalCodeDestination: destinationPostalCode,
            dimensions: {
                weight: Math.round(weight), // gramos
                height: Math.round(dimensions.height || 10),
                width: Math.round(dimensions.width || 20),
                length: Math.round(dimensions.length || 30)
            }
        };
        
        // Se especificou tipo de entrega, adicionar
        if (deliveryType) {
            requestBody.deliveredType = deliveryType;
        }
        
        const response = await fetch(`${baseURL}/rates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao cotizar envío');
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Erro na cotização:', error);
        return null;
    }
}

// ============================================
// COTIZAR ENVÍO - MODO DEMO (Fallback)
// ============================================

function cotizarEnvioDemo(destinationPostalCode, weight, deliveryType) {
    // Cálculo simplificado baseado em peso e tipo
    const basePrice = 2000;
    const pricePerGram = 0.8;
    const weightPrice = (weight / 1000) * pricePerGram * 1000;
    
    let finalPrice = basePrice + weightPrice;
    
    // Desconto para sucursal
    if (deliveryType === 'S') {
        finalPrice *= 0.8; // 20% desconto
    }
    
    // Retornar formato similar à API
    return {
        customerId: 'DEMO',
        validTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        rates: [
            {
                deliveredType: deliveryType || 'D',
                productType: 'CP',
                productName: 'Correo Argentino Clásico',
                price: Math.round(finalPrice),
                deliveryTimeMin: '2',
                deliveryTimeMax: '5'
            }
        ]
    };
}

// ============================================
// FUNÇÃO PRINCIPAL DE COTIZAÇÃO
// ============================================

async function calculateShippingMiCorreo(destinationPostalCode, weight, dimensions, deliveryType) {
    // Converter deliveryType do nosso formato para MiCorreo
    const deliveryTypeMap = {
        'homeDelivery': 'D',
        'agency': 'S',
        'locker': 'S'
    };
    
    const miCorreoDeliveryType = deliveryTypeMap[deliveryType] || 'D';
    
    // Tentar usar API real
    if (MICORREO_CONFIG.credentials.customerId !== 'SEU_CUSTOMER_ID') {
        try {
            const result = await cotizarEnvioMiCorreo(
                destinationPostalCode,
                weight,
                dimensions,
                miCorreoDeliveryType
            );
            
            if (result && result.rates && result.rates.length > 0) {
                // Pegar o primeiro rate (geralmente o mais barato)
                const rate = result.rates[0];
                return {
                    price: Math.round(rate.price),
                    deliveryTime: `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días`,
                    productName: rate.productName,
                    source: 'api'
                };
            }
        } catch (error) {
            console.warn('API falhou, usando modo demo:', error);
        }
    }
    
    // Fallback para modo demo
    const demoResult = cotizarEnvioDemo(destinationPostalCode, weight, miCorreoDeliveryType);
    if (demoResult && demoResult.rates && demoResult.rates.length > 0) {
        const rate = demoResult.rates[0];
        return {
            price: Math.round(rate.price),
            deliveryTime: `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días`,
            productName: rate.productName,
            source: 'demo'
        };
    }
    
    // Se tudo falhar, usar cálculo básico
    return {
        price: calculateShipping(weight, deliveryType, 'X', 0),
        deliveryTime: '3-7 días',
        productName: 'Envío Estándar',
        source: 'fallback'
    };
}

// ============================================
// CONSULTAR SUCURSALES
// ============================================

async function getSucursalesMiCorreo(provinceCode) {
    try {
        const token = await getAuthToken();
        const baseURL = MICORREO_CONFIG.baseURL[MICORREO_CONFIG.environment];
        
        const url = new URL(`${baseURL}/agencies`);
        url.searchParams.append('customerId', MICORREO_CONFIG.credentials.customerId);
        url.searchParams.append('provinceCode', provinceCode);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao obter sucursales');
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Erro ao obter sucursales:', error);
        return [];
    }
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MICORREO_CONFIG,
        calculateShippingMiCorreo,
        getSucursalesMiCorreo,
        getAuthToken
    };
}
