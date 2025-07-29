// Currency Converter Application
class CurrencyConverter {
    constructor() {
        this.apiKey = 'free'; // Using free tier - no API key needed for exchangerate-api.com
        this.baseUrl = 'https://api.exchangerate-api.com/v4/latest/';
        this.fallbackUrl = 'https://api.fixer.io/latest?access_key='; // Fallback API
        this.currencies = {};
        this.rates = {};
        this.baseCurrency = 'USD';
        this.converterCount = 0;
        this.popularPairs = [
            { from: 'USD', to: 'EUR' },
            { from: 'USD', to: 'GBP' },
            { from: 'USD', to: 'JPY' },
            { from: 'USD', to: 'CAD' },
            { from: 'EUR', to: 'GBP' },
            { from: 'GBP', to: 'JPY' }
        ];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadCurrencies();
        await this.loadExchangeRates();
        this.populateSelects();
        this.performInitialConversion();
        this.loadPopularRates();
        this.hideLoading();
    }

    setupEventListeners() {
        // Main converter event listeners
        document.getElementById('amount').addEventListener('input', () => this.performConversion());
        document.getElementById('from-currency').addEventListener('change', () => this.performConversion());
        document.getElementById('to-currency').addEventListener('change', () => this.performConversion());
        document.getElementById('swap-currencies').addEventListener('click', () => this.swapCurrencies());
        
        // Multiple converter button
        document.getElementById('add-converter').addEventListener('click', () => this.addConverter());
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.performConversion();
            }
        });
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        // Insert error message at the top of main content
        const main = document.querySelector('.main');
        main.insertBefore(errorDiv, main.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    async loadCurrencies() {
        try {
            this.showLoading();
            
            // Using a comprehensive list of currencies
            this.currencies = {
                'USD': 'US Dollar',
                'EUR': 'Euro',
                'GBP': 'British Pound Sterling',
                'JPY': 'Japanese Yen',
                'AUD': 'Australian Dollar',
                'CAD': 'Canadian Dollar',
                'CHF': 'Swiss Franc',
                'CNY': 'Chinese Yuan',
                'SEK': 'Swedish Krona',
                'NZD': 'New Zealand Dollar',
                'MXN': 'Mexican Peso',
                'SGD': 'Singapore Dollar',
                'HKD': 'Hong Kong Dollar',
                'NOK': 'Norwegian Krone',
                'KRW': 'South Korean Won',
                'TRY': 'Turkish Lira',
                'RUB': 'Russian Ruble',
                'INR': 'Indian Rupee',
                'BRL': 'Brazilian Real',
                'ZAR': 'South African Rand',
                'PLN': 'Polish Zloty',
                'ILS': 'Israeli Shekel',
                'DKK': 'Danish Krone',
                'CZK': 'Czech Koruna',
                'HUF': 'Hungarian Forint',
                'RON': 'Romanian Leu',
                'BGN': 'Bulgarian Lev',
                'HRK': 'Croatian Kuna',
                'ISK': 'Icelandic Krona',
                'PHP': 'Philippine Peso',
                'THB': 'Thai Baht',
                'MYR': 'Malaysian Ringgit',
                'IDR': 'Indonesian Rupiah',
                'VND': 'Vietnamese Dong',
                'AED': 'UAE Dirham',
                'SAR': 'Saudi Riyal',
                'QAR': 'Qatari Riyal',
                'KWD': 'Kuwaiti Dinar',
                'BHD': 'Bahraini Dinar',
                'OMR': 'Omani Rial',
                'JOD': 'Jordanian Dinar',
                'LBP': 'Lebanese Pound',
                'EGP': 'Egyptian Pound',
                'MAD': 'Moroccan Dirham',
                'TND': 'Tunisian Dinar',
                'DZD': 'Algerian Dinar',
                'LYD': 'Libyan Dinar',
                'SDG': 'Sudanese Pound',
                'ETB': 'Ethiopian Birr',
                'KES': 'Kenyan Shilling',
                'UGX': 'Ugandan Shilling',
                'TZS': 'Tanzanian Shilling',
                'RWF': 'Rwandan Franc',
                'NGN': 'Nigerian Naira',
                'GHS': 'Ghanaian Cedi',
                'XOF': 'West African CFA Franc',
                'XAF': 'Central African CFA Franc',
                'AOA': 'Angolan Kwanza',
                'MZN': 'Mozambican Metical',
                'BWP': 'Botswanan Pula',
                'SZL': 'Swazi Lilangeni',
                'LSL': 'Lesotho Loti',
                'NAD': 'Namibian Dollar',
                'ZMW': 'Zambian Kwacha',
                'ZWL': 'Zimbabwean Dollar',
                'MWK': 'Malawian Kwacha',
                'MGA': 'Malagasy Ariary',
                'MUR': 'Mauritian Rupee',
                'SCR': 'Seychellois Rupee',
                'KMF': 'Comorian Franc',
                'DJF': 'Djiboutian Franc',
                'SOS': 'Somali Shilling',
                'ERN': 'Eritrean Nakfa',
                'CLP': 'Chilean Peso',
                'ARS': 'Argentine Peso',
                'UYU': 'Uruguayan Peso',
                'PYG': 'Paraguayan Guarani',
                'BOB': 'Bolivian Boliviano',
                'PEN': 'Peruvian Sol',
                'COP': 'Colombian Peso',
                'VES': 'Venezuelan Bolívar',
                'GYD': 'Guyanese Dollar',
                'SRD': 'Surinamese Dollar',
                'GTQ': 'Guatemalan Quetzal',
                'BZD': 'Belize Dollar',
                'SVC': 'Salvadoran Colón',
                'HNL': 'Honduran Lempira',
                'NIO': 'Nicaraguan Córdoba',
                'CRC': 'Costa Rican Colón',
                'PAB': 'Panamanian Balboa',
                'CUP': 'Cuban Peso',
                'DOP': 'Dominican Peso',
                'HTG': 'Haitian Gourde',
                'JMD': 'Jamaican Dollar',
                'BBD': 'Barbadian Dollar',
                'TTD': 'Trinidad and Tobago Dollar',
                'XCD': 'East Caribbean Dollar',
                'AWG': 'Aruban Florin',
                'ANG': 'Netherlands Antillean Guilder',
                'BMD': 'Bermudian Dollar',
                'KYD': 'Cayman Islands Dollar',
                'BSB': 'Bahamian Dollar',
                'FJD': 'Fijian Dollar',
                'PGK': 'Papua New Guinean Kina',
                'SBD': 'Solomon Islands Dollar',
                'VUV': 'Vanuatu Vatu',
                'TOP': 'Tongan Paʻanga',
                'WST': 'Samoan Tala',
                'PKR': 'Pakistani Rupee',
                'BDT': 'Bangladeshi Taka',
                'LKR': 'Sri Lankan Rupee',
                'NPR': 'Nepalese Rupee',
                'BTN': 'Bhutanese Ngultrum',
                'MVR': 'Maldivian Rufiyaa',
                'AFN': 'Afghan Afghani',
                'IRR': 'Iranian Rial',
                'IQD': 'Iraqi Dinar',
                'SYP': 'Syrian Pound',
                'YER': 'Yemeni Rial',
                'UZS': 'Uzbekistani Som',
                'KZT': 'Kazakhstani Tenge',
                'KGS': 'Kyrgyzstani Som',
                'TJS': 'Tajikistani Somoni',
                'TMT': 'Turkmenistani Manat',
                'AZN': 'Azerbaijani Manat',
                'GEL': 'Georgian Lari',
                'AMD': 'Armenian Dram',
                'BYN': 'Belarusian Ruble',
                'UAH': 'Ukrainian Hryvnia',
                'MDL': 'Moldovan Leu',
                'MNT': 'Mongolian Tugrik',
                'KPW': 'North Korean Won',
                'LAK': 'Lao Kip',
                'KHR': 'Cambodian Riel',
                'MMK': 'Myanmar Kyat',
                'BND': 'Brunei Dollar',
                'TWD': 'Taiwan Dollar'
            };
        } catch (error) {
            console.error('Error loading currencies:', error);
            this.showError('Failed to load currency list. Using default currencies.');
        }
    }

    async loadExchangeRates() {
        try {
            const response = await fetch(`${this.baseUrl}${this.baseCurrency}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.rates = data.rates;
            
            // Update last updated time
            const lastUpdated = new Date().toLocaleString();
            document.getElementById('last-updated').textContent = `Last updated: ${lastUpdated}`;
            
        } catch (error) {
            console.error('Error loading exchange rates:', error);
            this.showError('Failed to load real-time exchange rates. Please check your internet connection and try again.');
            
            // Use fallback rates for demo purposes
            this.rates = {
                'EUR': 0.85,
                'GBP': 0.73,
                'JPY': 110.0,
                'CAD': 1.25,
                'AUD': 1.35,
                'CHF': 0.92
            };
        }
    }

    populateSelects() {
        const fromSelect = document.getElementById('from-currency');
        const toSelect = document.getElementById('to-currency');
        
        // Clear existing options
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        
        // Sort currencies alphabetically by code
        const sortedCurrencies = Object.entries(this.currencies).sort((a, b) => a[0].localeCompare(b[0]));
        
        // Populate select elements
        sortedCurrencies.forEach(([code, name]) => {
            const option1 = new Option(`${code} - ${name}`, code);
            const option2 = new Option(`${code} - ${name}`, code);
            
            fromSelect.appendChild(option1);
            toSelect.appendChild(option2);
        });
        
        // Set default values
        fromSelect.value = 'USD';
        toSelect.value = 'EUR';
    }

    async performConversion() {
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;
        
        if (amount <= 0) {
            document.getElementById('main-result').innerHTML = '<span class="result-amount">0.00</span> <span class="result-currency">' + toCurrency + '</span>';
            document.getElementById('exchange-rate').textContent = `1 ${fromCurrency} = 0.00 ${toCurrency}`;
            return;
        }
        
        try {
            const convertedAmount = await this.convertCurrency(amount, fromCurrency, toCurrency);
            const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
            
            // Update main result display
            document.getElementById('main-result').innerHTML = 
                `<span class="result-amount">${convertedAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> <span class="result-currency">${toCurrency}</span>`;
            
            document.getElementById('exchange-rate').textContent = 
                `1 ${fromCurrency} = ${exchangeRate.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})} ${toCurrency}`;
            
            // Update all mini converters
            this.updateMiniConverters();
            
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError('Failed to perform currency conversion. Please try again.');
        }
    }

    async performInitialConversion() {
        // Set default amount and perform initial conversion
        document.getElementById('amount').value = '1';
        await this.performConversion();
    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }
        
        try {
            // If converting from base currency (USD)
            if (fromCurrency === this.baseCurrency) {
                return amount * (this.rates[toCurrency] || 1);
            }
            
            // If converting to base currency (USD)
            if (toCurrency === this.baseCurrency) {
                return amount / (this.rates[fromCurrency] || 1);
            }
            
            // Converting between two non-base currencies
            const usdAmount = amount / (this.rates[fromCurrency] || 1);
            return usdAmount * (this.rates[toCurrency] || 1);
            
        } catch (error) {
            console.error('Currency conversion error:', error);
            throw new Error('Failed to convert currency');
        }
    }

    async getExchangeRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return 1;
        }
        
        try {
            const convertedAmount = await this.convertCurrency(1, fromCurrency, toCurrency);
            return convertedAmount;
        } catch (error) {
            console.error('Exchange rate error:', error);
            return 0;
        }
    }

    swapCurrencies() {
        const fromSelect = document.getElementById('from-currency');
        const toSelect = document.getElementById('to-currency');
        
        const fromValue = fromSelect.value;
        const toValue = toSelect.value;
        
        fromSelect.value = toValue;
        toSelect.value = fromValue;
        
        // Add swap animation class
        const swapBtn = document.getElementById('swap-currencies');
        swapBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            swapBtn.style.transform = '';
        }, 300);
        
        this.performConversion();
    }

    addConverter() {
        this.converterCount++;
        const convertersGrid = document.getElementById('multiple-converters');
        
        const converterDiv = document.createElement('div');
        converterDiv.className = 'mini-converter fade-in';
        converterDiv.id = `converter-${this.converterCount}`;
        
        converterDiv.innerHTML = `
            <button class="remove-btn" onclick="currencyConverter.removeConverter(${this.converterCount})">
                <i class="fas fa-times"></i>
            </button>
            <div class="mini-converter-form">
                <select class="from-currency" onchange="currencyConverter.updateMiniConverter(${this.converterCount})">
                    ${this.generateCurrencyOptions()}
                </select>
                <select class="to-currency" onchange="currencyConverter.updateMiniConverter(${this.converterCount})">
                    ${this.generateCurrencyOptions()}
                </select>
            </div>
            <div class="mini-result" id="mini-result-${this.converterCount}">
                1 USD = 0.85 EUR
            </div>
        `;
        
        convertersGrid.appendChild(converterDiv);
        
        // Set default values for the new converter
        const fromSelect = converterDiv.querySelector('.from-currency');
        const toSelect = converterDiv.querySelector('.to-currency');
        
        // Set different default pairs for variety
        const defaultPairs = [
            ['USD', 'EUR'],
            ['GBP', 'USD'],
            ['JPY', 'USD'],
            ['CAD', 'USD'],
            ['AUD', 'USD']
        ];
        
        const pairIndex = (this.converterCount - 1) % defaultPairs.length;
        fromSelect.value = defaultPairs[pairIndex][0];
        toSelect.value = defaultPairs[pairIndex][1];
        
        this.updateMiniConverter(this.converterCount);
    }

    removeConverter(converterId) {
        const converter = document.getElementById(`converter-${converterId}`);
        if (converter) {
            converter.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                converter.remove();
            }, 300);
        }
    }

    async updateMiniConverter(converterId) {
        const converter = document.getElementById(`converter-${converterId}`);
        if (!converter) return;
        
        const fromCurrency = converter.querySelector('.from-currency').value;
        const toCurrency = converter.querySelector('.to-currency').value;
        const resultDiv = document.getElementById(`mini-result-${converterId}`);
        
        try {
            const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
            resultDiv.textContent = `1 ${fromCurrency} = ${exchangeRate.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})} ${toCurrency}`;
        } catch (error) {
            resultDiv.textContent = `Error loading rate`;
            console.error('Mini converter error:', error);
        }
    }

    updateMiniConverters() {
        const converters = document.querySelectorAll('.mini-converter');
        converters.forEach(converter => {
            const converterId = converter.id.split('-')[1];
            this.updateMiniConverter(parseInt(converterId));
        });
    }

    generateCurrencyOptions() {
        const sortedCurrencies = Object.entries(this.currencies).sort((a, b) => a[0].localeCompare(b[0]));
        return sortedCurrencies.map(([code, name]) => 
            `<option value="${code}">${code} - ${name}</option>`
        ).join('');
    }

    async loadPopularRates() {
        const ratesGrid = document.getElementById('popular-rates');
        ratesGrid.innerHTML = '';
        
        for (const pair of this.popularPairs) {
            try {
                const rate = await this.getExchangeRate(pair.from, pair.to);
                const rateCard = document.createElement('div');
                rateCard.className = 'rate-card fade-in';
                
                rateCard.innerHTML = `
                    <div class="rate-pair">${pair.from}/${pair.to}</div>
                    <div class="rate-value">${rate.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</div>
                `;
                
                ratesGrid.appendChild(rateCard);
            } catch (error) {
                console.error(`Error loading rate for ${pair.from}/${pair.to}:`, error);
            }
        }
    }

    // Utility method to refresh all data
    async refreshData() {
        this.showLoading();
        try {
            await this.loadExchangeRates();
            await this.performConversion();
            await this.loadPopularRates();
            this.updateMiniConverters();
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.innerHTML = '<i class="fas fa-check-circle"></i> Exchange rates updated successfully!';
            
            const main = document.querySelector('.main');
            main.insertBefore(successDiv, main.firstChild);
            
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 3000);
            
        } catch (error) {
            this.showError('Failed to refresh exchange rates. Please try again.');
        } finally {
            this.hideLoading();
        }
    }
}

// Add slideOut animation for removing converters
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(-100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.currencyConverter = new CurrencyConverter();
    
    // Auto-refresh rates every 5 minutes
    setInterval(() => {
        currencyConverter.refreshData();
    }, 300000); // 5 minutes
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F5' && e.ctrlKey) {
            e.preventDefault();
            currencyConverter.refreshData();
        }
    });
});

// Service Worker registration removed - not needed for basic functionality

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
    console.error('Uncaught error:', e.error);
    if (window.currencyConverter) {
        window.currencyConverter.showError('An unexpected error occurred. Please refresh the page.');
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (window.currencyConverter) {
        window.currencyConverter.refreshData();
    }
});

window.addEventListener('offline', () => {
    if (window.currencyConverter) {
        window.currencyConverter.showError('You are currently offline. Exchange rates may not be up to date.');
    }
});
