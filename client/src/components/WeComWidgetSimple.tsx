import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Simplified WeCom Live Chat Widget Component
 * Displays a fixed "Contact Us" button in the bottom-right corner
 * with multi-language support
 */
export function WeComWidgetSimple() {
  const { language } = useLanguage();

  useEffect(() => {
    // Create and display WeCom widget button
    createWeComButton(language);

    // Cleanup function
    return () => {
      const container = document.getElementById('wecom-widget-simple-container');
      if (container) {
        container.remove();
      }
    };
  }, [language]);

  return null; // Widget is injected directly into the DOM
}

/**
 * Create WeCom widget button in the DOM
 */
function createWeComButton(language: string) {
  // Remove existing widget if any
  const existingContainer = document.getElementById('wecom-widget-simple-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  // Get trigger text based on language
  const triggerText = getTriggerText(language);

  // Create container
  const container = document.createElement('div');
  container.id = 'wecom-widget-simple-container';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  container.style.fontFamily = 'inherit';

  // Create button
  const button = document.createElement('button');
  button.id = 'wecom-widget-button-simple';
  button.textContent = triggerText;
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
  button.style.display = 'block';

  // Add hover effect
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#155a3a';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    button.style.transform = 'translateY(-2px)';
  });

  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = '#1f6f4a';
    button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    button.style.transform = 'translateY(0)';
  });

  // Add click handler
  button.addEventListener('click', () => {
    openWeComChat();
  });

  container.appendChild(button);
  document.body.appendChild(container);
}

/**
 * Open WeCom chat window
 */
function openWeComChat() {
  const corpId = 'wwd347ac3e0b84cbf7';
  const contactSecret = import.meta.env.VITE_WECOM_CONTACT_SECRET || '';

  // Build WeCom URL
  const params = new URLSearchParams({
    corpId: corpId,
    secret: contactSecret,
  });

  // WeCom chat URL
  const chatUrl = `https://open.work.weixin.qq.com/wwopen/js/code/web/0.0.1/jssdk.js?${params.toString()}`;

  // Open in new window
  window.open(chatUrl, 'wecom_chat', 'width=800,height=600,resizable=yes,scrollbars=yes');
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
