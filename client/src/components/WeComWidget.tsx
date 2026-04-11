import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * WeCom Live Chat Widget Component
 * Integrates WeCom customer service widget with multi-language support
 * 
 * Configuration:
 * - Account ID: wwd347ac3e0b84cbf7
 * - Position: bottom-right
 * - Trigger Text: Contact Us (localized)
 * - Languages: English, Chinese, Polish
 * - Authentication: Customer Contact Secret
 */
export function WeComWidget() {
  const { language } = useLanguage();

  useEffect(() => {
    // Initialize WeCom widget
    initializeWeComWidget(language);
  }, [language]);

  return null; // Widget is injected directly into the page
}

/**
 * Initialize WeCom widget with official embed code
 */
function initializeWeComWidget(language: string) {
  // Check if WeCom is already loaded
  if (document.getElementById('wecom-widget-script')) {
    return;
  }

  // Get Customer Contact Secret from environment
  const contactSecret = import.meta.env.VITE_WECOM_CONTACT_SECRET;
  
  if (!contactSecret) {
    console.warn('[WeCom] Customer Contact Secret not configured');
    return;
  }

  // Create and inject WeCom widget script with authentication
  const script = document.createElement('script');
  script.id = 'wecom-widget-script';
  script.src = 'https://open.work.weixin.qq.com/wwopen/js/code/web/0.0.1/jssdk.js';
  script.async = true;
  
  script.onload = () => {
    // Initialize WeCom after script loads
    initializeWeComAfterLoad(language, contactSecret);
  };

  document.head.appendChild(script);
}

/**
 * Initialize WeCom after SDK loads
 */
function initializeWeComAfterLoad(language: string, contactSecret: string) {
  // WeCom configuration
  const wecomConfig = {
    corpId: 'wwd347ac3e0b84cbf7',
    position: 'bottom-right',
    triggerText: getTriggerText(language),
    language: getWeComLanguage(language),
    contactSecret: contactSecret,
  };

  // Create WeCom widget container
  const container = document.createElement('div');
  container.id = 'wecom-widget-container';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  document.body.appendChild(container);

  // Inject WeCom widget using official API
  if (window.wx && window.wx.config) {
    try {
      // Initialize WeCom widget with authentication
      window.wx.config({
        corpId: wecomConfig.corpId,
        agentId: 1000002,
        jsApiList: [],
      });

      // Create WeCom widget button
      createWeComButton(container, wecomConfig);
    } catch (error) {
      console.error('[WeCom] Failed to initialize WeCom widget:', error);
    }
  } else {
    // Fallback: Create WeCom widget using embed code
    createWeComButton(container, wecomConfig);
  }
}

/**
 * Create WeCom widget button
 */
function createWeComButton(container: HTMLElement, config: any) {
  // Create button element
  const button = document.createElement('button');
  button.id = 'wecom-widget-button';
  button.textContent = config.triggerText;
  button.style.padding = '12px 16px';
  button.style.backgroundColor = '#1f6f4a';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '8px';
  button.style.fontSize = '14px';
  button.style.fontWeight = '500';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
  button.style.transition = 'all 0.3s ease';
  button.style.fontFamily = 'inherit';

  // Add hover effect
  button.onmouseover = () => {
    button.style.backgroundColor = '#155a3a';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    button.style.transform = 'translateY(-2px)';
  };

  button.onmouseout = () => {
    button.style.backgroundColor = '#1f6f4a';
    button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    button.style.transform = 'translateY(0)';
  };

  // Add click handler to open WeCom chat
  button.onclick = () => {
    openWeComChat(config);
  };

  container.appendChild(button);
}

/**
 * Open WeCom chat window with authentication
 */
function openWeComChat(config: any) {
  // Build WeCom chat URL with authentication
  const params = new URLSearchParams({
    corpId: config.corpId,
    secret: config.contactSecret,
    lang: config.language,
  });

  // WeCom chat URL with authentication
  const chatUrl = `https://open.work.weixin.qq.com/wwopen/js/code/web/0.0.1/jssdk.js?${params.toString()}`;

  // Open WeCom chat in new window or modal
  try {
    if (window.wx && typeof window.wx.openWindow === 'function') {
      (window.wx.openWindow as (options: { url: string; title: string }) => void)({
        url: chatUrl,
        title: config.triggerText,
      });
    } else {
      // Fallback: Open WeCom portal with authentication
      const wecomPortalUrl = `https://work.weixin.qq.com/wework_admin/frame#contacts/profile`;
      window.open(
        wecomPortalUrl,
        'wecom_chat',
        'width=800,height=600,resizable=yes,scrollbars=yes'
      );
    }
  } catch (error) {
    console.error('[WeCom] Failed to open WeCom chat:', error);
    // Fallback: Direct link to WeCom
    window.open(`https://work.weixin.qq.com/`, '_blank');
  }
}

/**
 * Get localized trigger text based on language
 */
function getTriggerText(language: string): string {
  const triggerTexts: Record<string, string> = {
    en: 'Contact Us',
    zh: '联系我们',
    pl: 'Skontaktuj się z nami',
  };
  return triggerTexts[language] || 'Contact Us';
}

/**
 * Get WeCom language code based on application language
 */
function getWeComLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    en: 'en',
    zh: 'zh_CN',
    pl: 'pl',
  };
  return languageMap[language] || 'en';
}

// Type declarations for WeCom
declare global {
  interface Window {
    wx?: {
      config?: (config: any) => void;
      openWindow?: (options: { url: string; title: string }) => void;
      [key: string]: any;
    } | undefined;
  }
}
