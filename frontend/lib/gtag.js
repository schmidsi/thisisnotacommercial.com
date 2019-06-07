export const GA_TRACKING_ID = "UA-141659238-1";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = url => {
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value
  });
};

if (process.browser) {
  window.dataLayer = window.dataLayer || [];

  window.gtag = (...args) => {
    dataLayer.push(...args);
  };

  gtag("js", new Date());
  gtag("config", GA_TRACKING_ID);
}
