export function getStyles(): string {
  return `
    @page {
      size: letter;
      margin: 10mm 15mm 15mm 15mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.4;
      font-size: 11px;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
    }
    .invoice-container { width: 100%; position: relative; }
    
    /* Decoración superior curvada estilizada */
    .header-curves-banner {
      width: 100%;
      height: 48px;
      margin-top: -10mm;
      margin-bottom: 12px;
    }
    
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 15px;
      margin-bottom: 5px;
    }
    .logo-area { display: flex; flex-direction: column; max-width: 60%; }
    
    /* Logo corporativo de Campo Maq - Incrementado tamaño a 85px */
    .company-logo { height: 85px; width: auto; align-self: flex-start; margin-bottom: 8px; }
    
    .company-details { font-size: 9.5px; color: #555555; line-height: 1.5; }
    .company-name { font-weight: 800; color: #1a1a1a; text-transform: uppercase; font-size: 11px; margin-bottom: 2px; }
    .quote-meta { text-align: right; max-width: 38%; }
    .quote-title { font-size: 26px; font-weight: 900; color: #1a1a1a; margin: 0 0 4px 0; letter-spacing: -0.8px; text-transform: uppercase; }
    .quote-number { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; display: inline-block; border-bottom: 2px solid #EBD600; padding-bottom: 2px; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, auto); gap: 5px 10px; justify-content: end; font-size: 10px; }
    .meta-label { font-weight: 700; color: #555555; text-align: right; text-transform: uppercase; font-size: 9px; }
    .meta-value { color: #1a1a1a; text-align: left; }
    
    .info-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
    .info-box { background-color: #fcfcfc; border-radius: 10px; padding: 12px 15px; border: 1px solid #e5e5e5; }
    .info-box-title { font-size: 10px; font-weight: 800; color: #1a1a1a; text-transform: uppercase; border-bottom: 2px solid #EBD600; padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.5px; }
    .info-grid { display: grid; grid-template-columns: auto 1fr; gap: 5px 8px; font-size: 10px; }
    .info-label { font-weight: 700; color: #777777; text-transform: uppercase; font-size: 8.5px; }
    .info-val { color: #1a1a1a; }
    
    .table-container { width: 100%; margin-bottom: 25px; }
    .products-table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    .products-table thead { display: table-header-group; }
    .products-table tr { page-break-inside: avoid; }
    .products-table th { background-color: #1A1A1A; color: #FFFFFF; font-weight: 700; text-transform: uppercase; font-size: 9px; padding: 10px 8px; border-bottom: 3px solid #EBD600; letter-spacing: 0.5px; text-align: left; }
    .products-table th.col-right { text-align: right; }
    .products-table th.col-center { text-align: center; }
    .products-table td { padding: 10px 8px; border-bottom: 1px solid #e9e9e9; vertical-align: middle; font-size: 10px; }
    .products-table tbody tr:nth-child(even) td { background-color: #fbfbfb; }
    .products-table tbody tr:last-child td { border-bottom: 2px solid #1A1A1A; }
    
    .img-cell { width: 48px; height: 48px; border: 1px solid #e5e5e5; background-color: #ffffff; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin: 0 auto; }
    .img-cell img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .img-placeholder { font-size: 8px; color: #999999; text-align: center; line-height: 1.1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .img-placeholder svg { width: 16px; height: 16px; fill: #bbbbbb; margin-bottom: 2px; }
    
    .prod-name { font-weight: 700; color: #1a1a1a; font-size: 10.5px; margin-bottom: 2px; }
    .prod-meta { font-size: 8.5px; color: #8A8A8A; margin-bottom: 4px; text-transform: uppercase; }
    .prod-desc { font-size: 9px; color: #555555; line-height: 1.35; }
    
    .num-value { font-weight: 600; color: #1a1a1a; }
    .col-right { text-align: right; }
    .col-center { text-align: center; }
    
    .footer-container { display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 25px; page-break-inside: avoid; }
    .notes-section { display: flex; flex-direction: column; gap: 12px; }
    .note-card { background-color: #fafafa; border-radius: 8px; padding: 10px 12px; border: 1px solid #e5e5e5; border-left: 4px solid #1A1A1A; }
    .note-card.yellow-accent { border-left-color: #EBD600; }
    .note-title { font-size: 9px; font-weight: 800; color: #1a1a1a; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.3px; }
    .note-text { font-size: 9px; color: #555555; line-height: 1.4; }
    
    .totals-box { background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e5e5; padding: 12px; align-self: start; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 4px; font-size: 10.5px; border-bottom: 1px solid #f0f0f0; }
    .totals-row:last-child { border-bottom: none; }
    .totals-row.final-total { background-color: #EBD600; color: #1A1A1A; font-weight: 800; font-size: 13.5px; padding: 8px 10px; margin-top: 8px; border-radius: 8px; display: flex; justify-content: space-between; }
    
    .page-footer { border-top: 1px solid #e5e5e5; padding-top: 15px; margin-top: 15px; text-align: center; page-break-inside: avoid; }
    .legal-notice { font-size: 8.5px; color: #777777; margin-bottom: 15px; line-height: 1.3; }
    
    .brands-section {
      margin-top: 10px;
      margin-bottom: 15px;
      text-align: center;
    }
    .brands-title { font-size: 8px; font-weight: 800; color: #999999; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 10px; }
    .brands-container { display: flex; justify-content: center; align-items: center; width: 100%; }
    .brands-strip {
      width: 100%;
      max-height: 110px;
      display: block;
      margin: 0 auto;
      object-fit: contain;
      filter: none;
      opacity: 1;
      mix-blend-mode: multiply;
    }
    .page-number-container { font-size: 9px; color: #888888; margin-top: 10px; }
  `;
}
