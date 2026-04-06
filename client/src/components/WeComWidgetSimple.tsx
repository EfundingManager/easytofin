import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * WeComWidgetSimple Component
 * 
 * Displays a "企业微信" (WeCom) button that opens WeCom chat
 * Only displays on Chinese language pages
 * Works without requiring WeCom SDK to load
 */
export function WeComWidgetSimple() {
  const { language } = useLanguage();

  useEffect(() => {
    // Only initialize widget if language is Chinese
    if (language === 'zh') {
      initializeWeComWidget();
    } else {
      // Remove widget if language is not Chinese
      removeWeComWidget();
    }

    // Cleanup on unmount
    return () => {
      removeWeComWidget();
    };
  }, [language]);

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
  button.textContent = '企业微信';
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

  console.log('WeCom widget initialized successfully for Chinese language');
}

/**
 * Remove WeCom widget from DOM
 */
function removeWeComWidget() {
  const widget = document.getElementById('wecom-widget-container-simple');
  if (widget) {
    widget.remove();
    console.log('WeCom widget removed - not Chinese language');
  }
}

/**
 * Open WeCom chat window using direct URL approach
 * Uses the official WeCom API link with kfid for proper customer service routing
 */
function openWeComChat() {
  // WeCom API link with kfid for customer service routing
  const wecomChatUrl = 'https://work.weixin.qq.com/kfid/kfc17931e7a2589a51a';

  console.log('Opening WeCom chat window with kfid');

  try {
    // Try to open WeCom in a new window
    const wecomWindow = window.open(
      wecomChatUrl,
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
  // Use WeCom's official API link with kfid as fallback
  const fallbackUrl = 'https://work.weixin.qq.com/kfid/kfc17931e7a2589a51a';
  
  console.log('Using WeCom fallback URL:', fallbackUrl);
  
  try {
    window.open(fallbackUrl, '_blank');
  } catch (error) {
    console.error('Error opening WeCom fallback:', error);
    // Last resort: Show alert with WeCom info
    alert('Please visit https://work.weixin.qq.com/kfid/kfc17931e7a2589a51a to contact us via WeCom');
  }
}
