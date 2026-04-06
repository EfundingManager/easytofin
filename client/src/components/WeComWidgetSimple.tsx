import { useEffect } from 'react';

/**
 * WeComWidgetSimple Component
 * 
 * Displays a simple "Contact Us" button that opens WeCom chat
 * Supports multi-language trigger text (English, Chinese, Polish)
 */
export function WeComWidgetSimple() {
  useEffect(() => {
    // Initialize WeCom widget when component mounts
    initializeWeComWidget();

    // Cleanup on unmount
    return () => {
      // Remove event listeners if needed
    };
  }, []);

  return null; // This component doesn't render anything, it injects HTML directly
}

/**
 * Initialize WeCom widget and inject button into DOM
 */
function initializeWeComWidget() {
  // Check if widget already exists
  const existingWidget = document.getElementById('wecom-widget-button-simple');
  if (existingWidget) {
    return;
  }

  // Create container for WeCom button
  const container = document.createElement('div');
  container.id = 'wecom-widget-container-simple';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `;

  // Create button
  const button = document.createElement('button');
  button.id = 'wecom-widget-button-simple';
  button.textContent = getLocalizedTriggerText();
  button.style.cssText = `
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  // Add hover effect
  button.onmouseover = () => {
    button.style.backgroundColor = '#27ae60';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    button.style.transform = 'translateY(-2px)';
  };

  button.onmouseout = () => {
    button.style.backgroundColor = '#2ecc71';
    button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    button.style.transform = 'translateY(0)';
  };

  // Add click handler
  button.addEventListener('click', () => {
    openWeComChat();
  });

  container.appendChild(button);
  document.body.appendChild(container);

  // Load WeCom SDK
  loadWeComSDK();
}

/**
 * Load WeCom SDK script
 */
function loadWeComSDK() {
  // Check if WeCom SDK is already loaded
  if (window.wx && window.wx.corpId) {
    console.log('WeCom SDK already loaded');
    return;
  }

  // Create script element for WeCom SDK
  const script = document.createElement('script');
  script.src = 'https://open.work.weixin.qq.com/wwopen/js/code/web/0.0.1/jssdk.js';
  script.async = true;
  script.onload = () => {
    console.log('WeCom SDK loaded successfully');
    // Initialize WeCom with your corp ID
    const corpId = 'wwd347ac3e0b84cbf7';
    const contactSecret = import.meta.env.VITE_WECOM_CONTACT_SECRET || '';
    
    // WeCom SDK initialization (if needed)
    if (window.wx && typeof window.wx.config === 'function') {
      window.wx.config({
        corpId: corpId,
        agentId: 1000001, // Default agent ID
        jsApiList: [],
      });
    }
  };
  script.onerror = () => {
    console.error('Failed to load WeCom SDK');
  };

  document.head.appendChild(script);
}

/**
 * Open WeCom chat window
 */
function openWeComChat() {
  const corpId = 'wwd347ac3e0b84cbf7';
  const contactSecret = import.meta.env.VITE_WECOM_CONTACT_SECRET || '';

  // WeCom chat URL - use the official format
  // This opens WeCom's web interface for the specified corp ID
  const baseUrl = 'https://open.work.weixin.qq.com/wwopen/js/code/web/0.0.1/jssdk.js';
  
  // Build the chat URL with parameters
  const params = new URLSearchParams();
  params.append('corpId', corpId);
  if (contactSecret) {
    params.append('secret', contactSecret);
  }

  const chatUrl = `${baseUrl}?${params.toString()}`;

  console.log('Opening WeCom chat with URL:', chatUrl);

  // Open WeCom in a new window/tab
  const wecomWindow = window.open(
    chatUrl,
    'wecom_chat',
    'width=800,height=600,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no'
  );

  if (!wecomWindow) {
    console.warn('Failed to open WeCom window. Popup may be blocked.');
    // Fallback: Try to open WeCom main page
    window.open('https://work.weixin.qq.com/', '_blank');
  }
}

/**
 * Get localized trigger text based on language
 */
function getLocalizedTriggerText(): string {
  // Detect language from HTML lang attribute or navigator
  const htmlLang = document.documentElement.lang || navigator.language || 'en';
  const lang = htmlLang.toLowerCase().split('-')[0];

  const translations: Record<string, string> = {
    en: 'Contact Us',
    zh: '联系我们',
    pl: 'Skontaktuj się z nami',
  };

  return translations[lang] || translations['en'];
}

// Extend window interface to include WeCom SDK
declare global {
  interface Window {
    wx?: {
      corpId?: string;
      config?: (config: any) => void;
    };
  }
}
