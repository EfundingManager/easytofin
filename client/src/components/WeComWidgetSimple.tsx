import { useEffect } from 'react';

/**
 * WeComWidgetSimple Component
 * 
 * Displays a simple "Contact Us" button that opens WeCom chat
 * Supports multi-language trigger text (English, Chinese, Polish)
 * Works without requiring WeCom SDK to load
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

  console.log('WeCom widget initialized successfully');
}

/**
 * Open WeCom chat window using direct URL approach
 * This approach doesn't require SDK loading
 */
function openWeComChat() {
  const corpId = 'wwd347ac3e0b84cbf7';
  const contactSecret = import.meta.env.VITE_WECOM_CONTACT_SECRET || '';

  // WeCom official chat URL format
  // Using the web interface URL directly
  const wecomBaseUrl = 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect';
  
  // Build the chat URL with parameters
  const params = new URLSearchParams();
  params.append('appid', corpId);
  params.append('agentid', '1000001'); // Default agent ID
  params.append('redirect_uri', window.location.origin);
  params.append('state', 'wecom_contact');
  params.append('usertype', 'member');

  // Alternative: Use WeCom's direct chat URL if available
  // This is the standard way to open WeCom in a new window
  const chatUrl = `https://work.weixin.qq.com/wework_admin/loginpage_wx?redirect_uri=${encodeURIComponent(window.location.origin)}`;

  console.log('Opening WeCom chat window');

  try {
    // Try to open WeCom in a new window
    const wecomWindow = window.open(
      chatUrl,
      'wecom_chat',
      'width=800,height=600,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no'
    );

    if (!wecomWindow) {
      console.warn('Failed to open WeCom window. Popup may be blocked.');
      // Fallback: Open WeCom main page
      openWeComFallback();
    } else {
      console.log('WeCom window opened successfully');
    }
  } catch (error) {
    console.error('Error opening WeCom window:', error);
    openWeComFallback();
  }
}

/**
 * Fallback method to open WeCom if popup is blocked
 */
function openWeComFallback() {
  const corpId = 'wwd347ac3e0b84cbf7';
  
  // Use WeCom's official web interface
  const fallbackUrl = `https://work.weixin.qq.com/wework_admin/`;
  
  console.log('Using WeCom fallback URL:', fallbackUrl);
  
  try {
    window.open(fallbackUrl, '_blank');
  } catch (error) {
    console.error('Error opening WeCom fallback:', error);
    // Last resort: Show alert with WeCom info
    alert('Please visit https://work.weixin.qq.com/ to contact us via WeCom');
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
