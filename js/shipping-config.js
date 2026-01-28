// ============================================
// CONFIGURACIÓN DE FLETE - CORREO ARGENTINO
// ============================================

// Tabela de preços de frete por peso (en gramos) e tipo de entrega
// VALORES PARA PESO VOLUMÉTRICO 1.6kg (caixa 20x20x20cm)
// Baseado em: Cliente simulou $8.308 para Buenos Aires
// Sistema tenta usar API MiCorreo primeiro, depois usa esta tabela

const SHIPPING_CONFIG = {
    // Frete por peso (en pesos argentinos)
    // IMPORTANTE: Produtos com 1kg mas caixa 20x20x20 = 1.6kg volumétrico
    weightRanges: [
        { maxWeight: 500, price: 5500 },      // Hasta 500g (volumétrico ~800g) → $5.500
        { maxWeight: 1000, price: 8300 },     // Hasta 1kg (volumétrico 1.6kg) → $8.300
        { maxWeight: 2000, price: 12000 },    // Hasta 2kg (volumétrico 3.2kg) → $12.000
        { maxWeight: 5000, price: 22000 },    // Hasta 5kg (volumétrico 8kg) → $22.000
        { maxWeight: 10000, price: 38000 },   // Hasta 10kg (volumétrico 16kg) → $38.000
        { maxWeight: 25000, price: 68000 },   // Hasta 25kg (volumétrico 40kg) → $68.000
    ],
    
    // Multiplicadores por tipo de entrega
    deliveryTypes: {
        homeDelivery: 1.0,    // Entrega a domicilio (100%)
        agency: 0.8,          // Retiro en sucursal (20% descuento)
        locker: 0.85          // Retiro en locker (15% descuento)
    },
    
    // Recargo por provincia remota (opcional)
    remoteProvinces: {
        'V': 1.3,  // Tierra del Fuego - 30% recargo
        'Z': 1.2,  // Santa Cruz - 20% recargo
        'U': 1.15, // Chubut - 15% recargo
        'Q': 1.15, // Neuquén - 15% recargo
        'R': 1.15, // Río Negro - 15% recargo
    },
    
    // Envío gratis a partir de (en pesos)
    freeShippingThreshold: 150000,
    
    // Costo fijo mínimo de envío
    minimumShipping: 2000,
};

// Función para calcular el precio de envío
function calculateShipping(weight, deliveryType, province, orderTotal) {
    // Envío gratis si supera el umbral
    if (orderTotal >= SHIPPING_CONFIG.freeShippingThreshold) {
        return 0;
    }
    
    // Buscar precio base por peso
    let basePrice = SHIPPING_CONFIG.minimumShipping;
    
    for (const range of SHIPPING_CONFIG.weightRanges) {
        if (weight <= range.maxWeight) {
            basePrice = range.price;
            break;
        }
    }
    
    // Si supera el peso máximo, usar el precio del último rango
    if (weight > SHIPPING_CONFIG.weightRanges[SHIPPING_CONFIG.weightRanges.length - 1].maxWeight) {
        basePrice = SHIPPING_CONFIG.weightRanges[SHIPPING_CONFIG.weightRanges.length - 1].price;
    }
    
    // Aplicar multiplicador por tipo de entrega
    const deliveryMultiplier = SHIPPING_CONFIG.deliveryTypes[deliveryType] || 1.0;
    let finalPrice = basePrice * deliveryMultiplier;
    
    // Aplicar recargo por provincia remota
    if (SHIPPING_CONFIG.remoteProvinces[province]) {
        finalPrice *= SHIPPING_CONFIG.remoteProvinces[province];
    }
    
    // Redondear al entero más cercano
    return Math.round(finalPrice);
}

// Códigos de provincia (según ISO 3166-2:AR)
const PROVINCE_CODES = {
    'A': 'Salta',
    'B': 'Provincia de Buenos Aires',
    'C': 'Ciudad Autónoma de Buenos Aires',
    'D': 'San Luis',
    'E': 'Entre Ríos',
    'F': 'La Rioja',
    'G': 'Santiago del Estero',
    'H': 'Chaco',
    'J': 'San Juan',
    'K': 'Catamarca',
    'L': 'La Pampa',
    'M': 'Mendoza',
    'N': 'Misiones',
    'P': 'Formosa',
    'Q': 'Neuquén',
    'R': 'Río Negro',
    'S': 'Santa Fe',
    'T': 'Tucumán',
    'U': 'Chubut',
    'V': 'Tierra del Fuego',
    'W': 'Corrientes',
    'X': 'Córdoba',
    'Y': 'Jujuy',
    'Z': 'Santa Cruz'
};

// Tipos de entrega
const DELIVERY_TYPES = {
    'homeDelivery': 'Entrega a Domicilio',
    'agency': 'Retiro en Sucursal',
    'locker': 'Retiro en Locker'
};

// Exportar configuraciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SHIPPING_CONFIG,
        PROVINCE_CODES,
        DELIVERY_TYPES,
        calculateShipping
    };
}
