import moment from 'moment';

const mjmlTemplate = `
<mjml>
  <mj-body background-color="#FAFAFA">
      <mj-section padding-bottom="32px" background-color="#FFFFFF">
        <mj-column width="100%">
          <mj-text font-size="20px" color="#232323" font-family="Helvetica Neue" font-weight="400">
            <h2>{{meta.subject}}</h2>
          </mj-text>
          <mj-text font-size="20px" color="#232323" font-family="Helvetica Neue">
            <p>{{meta.thankyou}} <a style="color:#2CAADF" href="{{shopUrl}}">{{shopName}}</a></p>
          </mj-text>
          <mj-text align="left" font-size="20px" color="#232323" font-family="Helvetica Neue" font-weight="200">
            <span>Order number: {{context.order.orderNumber}}</span><br/>
            <span>Date: {{orderDate}}</span>
          </mj-text>
          <mj-text align="left" font-size="20px" color="#232323">Address</mj-text>
          <mj-text align="left">
            {{context.order.billingAddress.firstName}} {{context.order.billingAddress.lastName}}<br/>
            {{context.order.billingAddress.company}}<br/>
            {{context.order.billingAddress.addressLine}}<br/>
            {{context.order.billingAddress.addressLine2}}<br/>
            {{context.order.billingAddress.postalCode}} {{context.order.billingAddress.city}} {{context.order.billingAddress.regionCode}}<br/>
            {{context.order.billingAddress.countryCode}}<br/>
          </mj-text>
          <mj-divider border-width="1px" border-style="dashed" border-color="lightgrey" />
          <mj-text align="left" font-size="20px" color="#232323">Produkte</mj-text>
          <mj-table>
            <tr style="border-bottom:1px solid #ecedee;text-align:left;padding:15px 0;">
              <th style="padding: 0 15px 0 0;">Article</th>
              <th style="padding: 0 15px;">Quantity</th>
              <th style="padding: 0 15px;">Price</th>
            </tr>
            {{#meta.positions}}
              <tr>
                <td style="padding: 0 15px 0 0;">{{product}}</td>
                <td style="padding: 0 15px;">{{quantity}}</td>
                <th style="padding: 0 15px;">{{total}}</th>
              </tr>
            {{/meta.positions}}
          </mj-table>
          <mj-text align="left" font-size="20px" color="#232323" font-family="Helvetica Neue" font-weight="200">
            <span>Message: {{context.order.context.message}}</span><br/>
          </mj-text>
        </mj-column>
      </mj-section>
  </mj-body>
</mjml>
`;

const { EMAIL_FROM, EMAIL_WEBSITE_NAME, EMAIL_WEBSITE_URL } = process.env;

const textTemplate = `
  {{meta.thankyou}} {{shopName}}\n
  \n
`;

const texts = {
  en: {
    buttonText: 'Follow purchase order status',
    thankyou: 'Thank you for your order:',
    subject: `${EMAIL_WEBSITE_NAME}: Order confirmation`
  },
  de: {
    buttonText: 'Bestellstatus verfolgen',
    thankyou: 'Vielen Dank für deine Bestellung bei',
    subject: `${EMAIL_WEBSITE_NAME}: Bestellbestätigung`
  },
  fr: {
    buttonText: 'Follow purchase order status',
    thankyou: 'Thank you for your order on',
    subject: `${EMAIL_WEBSITE_NAME}: Order confirmation`
  }
};

export default (
  meta,
  { locale, ...context },
  { renderToText, renderMjmlToHtml }
) => {
  const langCode = locale.substr(0, 2).toLowerCase();
  const momentDate = moment(context.order.ordered);
  momentDate.locale('de-CH');
  const orderDate = momentDate.format('lll');

  console.log(
    'confirmation',
    {
      ...texts[langCode],
      ...meta
    },
    context
  );

  return {
    to: to => to || 'admin@localhost',
    from: from => from || EMAIL_FROM,
    subject: () => texts[langCode].subject,
    text: () =>
      renderToText(textTemplate, {
        meta: {
          ...texts[langCode],
          ...meta
        },
        shopName: EMAIL_WEBSITE_NAME,
        shopUrl: EMAIL_WEBSITE_URL,
        orderDate,
        context
      }),
    html: () =>
      renderMjmlToHtml(mjmlTemplate, {
        meta: {
          ...texts[langCode],
          ...meta
        },
        shopName: EMAIL_WEBSITE_NAME,
        shopUrl: EMAIL_WEBSITE_URL,
        orderDate,
        context
      })
  };
};
