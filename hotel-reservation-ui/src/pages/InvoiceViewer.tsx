import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// Use the reservation service for fetching reservation details
import { getMyReservations } from '../api/reservationService';
import Spinner from '../components/common/Spinner';

const InvoiceViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);
  
  const reservationId = parseInt(id || '0');
  const { data: reservation, isLoading, error } = useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: async () => {
      const list = await getMyReservations();
      return list.find((r: any) => r.id === reservationId);
    },
    enabled: !!id,
  });
  
  const formatMoney = (value: unknown) => Number(value ?? 0).toFixed(2);
  const safeDate = (d?: string | number | Date) => d ? new Date(d).toLocaleDateString() : 'N/A';
  
  const handleDownload = async () => {
    if (!id || !reservation) return;
    
    setIsDownloading(true);
    setDownloadMessage(null);
    
    try {
      // Create a printable HTML version of the invoice
      const invoiceHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice #${reservation.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .invoice-header h1 {
              font-size: 24px;
              margin: 0;
            }
            .invoice-header p {
              font-size: 14px;
              margin: 5px 0;
            }
            .company-details {
              margin-bottom: 20px;
            }
            .billing-details {
              margin-bottom: 20px;
              padding: 10px 0;
              border-top: 1px solid #eee;
              border-bottom: 1px solid #eee;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            th {
              background-color: #f8f9fa;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              font-weight: bold;
            }
            .payment-terms {
              font-size: 12px;
              color: #666;
              margin-top: 20px;
            }
            .status-paid {
              color: #28a745;
            }
            .status-pending {
              color: #ffc107;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>Hotel Reservation System</h1>
            <p>Invoice #${reservation.id}</p>
          </div>
          
          <div style="display: flex; justify-content: space-between;">
            <div class="company-details">
              <p>123 Hotel Street</p>
              <p>City, State 12345</p>
              <p>Phone: (555) 123-4567</p>
            </div>
            
            <div style="text-align: right;">
              <p>Invoice Date: ${safeDate(reservation.createdAt)}</p>
              <p>Due Date: ${safeDate(reservation.checkInDate)}</p>
              <p class="${reservation.paymentStatus === 'fully_paid' ? 'status-paid' : 'status-pending'}">
                Status: ${(reservation.paymentStatus || 'PENDING').toString().toUpperCase()}
              </p>
            </div>
          </div>
          
          <div class="billing-details">
            <h3 style="margin-top: 0;">Billed To:</h3>
            <p>${reservation.guestName}</p>
            <p>${reservation.email}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Dates</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <p style="font-weight: 500;">${reservation.roomType}</p>
                  <p style="font-size: 12px; color: #666;">Room #${reservation.roomId}</p>
                </td>
                <td>${safeDate(reservation.checkInDate)} - ${safeDate(reservation.checkOutDate)}</td>
                <td class="text-right">$${formatMoney(reservation.totalPrice)}</td>
              </tr>
              ${reservation.advanceAmount && Number(reservation.advanceAmount) > 0 ? `
                <tr>
                  <td style="color: #28a745;">Advance Payment</td>
                  <td style="color: #28a745;">${reservation.paymentDate ? new Date(reservation.paymentDate).toLocaleDateString() : 'N/A'}</td>
                  <td class="text-right" style="color: #28a745;">-$${formatMoney(reservation.advanceAmount)}</td>
                </tr>
              ` : ''}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2" class="text-right">Total Due:</td>
                <td class="text-right">$${formatMoney((reservation as any).remainingAmount ?? reservation.totalPrice)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="payment-terms">
            <h4 style="margin-bottom: 5px;">Payment Terms:</h4>
            <p>Payment is due upon receipt. Please make checks payable to Hotel Reservation System.</p>
          </div>
        </body>
        </html>
      `;
      
      // Create a hidden iframe to use for printing
      if (!printFrameRef.current) {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        printFrameRef.current = iframe;
      }
      
      // Write the HTML content to the iframe
      const iframeDoc = printFrameRef.current.contentDocument || printFrameRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(invoiceHTML);
        iframeDoc.close();
        
        // Wait for the content to load
        setTimeout(() => {
          try {
            // Trigger print dialog
            const win = printFrameRef.current?.contentWindow;
            if (win) {
              // Clean up after the print dialog finishes
              const cleanup = () => {
                if (printFrameRef.current) {
                  try { document.body.removeChild(printFrameRef.current); } catch {}
                  printFrameRef.current = null;
                }
                win.removeEventListener?.('afterprint', cleanup as any);
                setIsDownloading(false);
              };
              win.addEventListener?.('afterprint', cleanup as any);
              win.focus();
              win.print();
              // Fallback cleanup in case afterprint is not fired
              setTimeout(cleanup, 3000);
              
              setDownloadMessage('Invoice opened for printing. Save as PDF to download.');
              setTimeout(() => setDownloadMessage(null), 8000);
            }
          } catch (err) {
            console.error('Print error:', err);
            setDownloadMessage('Error generating PDF. Please try again.');
            setIsDownloading(false);
          }
        }, 500);
      } else {
        throw new Error('Could not access iframe document');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      setDownloadMessage('Error generating PDF. Please try again.');
      setIsDownloading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner />
      </div>
    );
  }
  
  if (error || !reservation) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>Could not load the invoice. It may not exist or you don't have permission to view it.</p>
        <Link to="/reservations" className="mt-4 inline-block text-blue-600 hover:underline">
          Return to reservations
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Invoice #{reservation.id}</h1>
        <div className="flex flex-col items-end">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          
          {downloadMessage && (
            <div className={`mt-2 text-sm font-medium ${downloadMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {downloadMessage}
            </div>
          )}
        </div>
      </div>
      
      {/* The rest of your component remains the same */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold">Hotel Reservation System</h2>
            <p className="text-gray-600">123 Hotel Street</p>
            <p className="text-gray-600">City, State 12345</p>
            <p className="text-gray-600">Phone: (555) 123-4567</p>
          </div>
          <div className="md:text-right">
            <p className="text-gray-600">Invoice Date: {safeDate(reservation.createdAt)}</p>
            <p className="text-gray-600">Due Date: {safeDate(reservation.checkInDate)}</p>
            <p className={`font-semibold ${
              reservation.paymentStatus === 'fully_paid' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              Status: {(reservation.paymentStatus || 'PENDING').toString().toUpperCase()}
            </p>
          </div>
        </div>
        
        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <h3 className="font-semibold mb-2">Billed To:</h3>
          <p>{reservation.guestName}</p>
          <p>{reservation.email}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2">Description</th>
                <th className="py-2">Dates</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3">
                  <p className="font-medium">{reservation.roomType}</p>
                  <p className="text-sm text-gray-600">Room #{reservation.roomId}</p>
                </td>
                <td className="py-3">
                  {safeDate(reservation.checkInDate)} - {safeDate(reservation.checkOutDate)}
                </td>
                <td className="py-3 text-right">${formatMoney(reservation.totalPrice)}</td>
              </tr>
              {reservation.advanceAmount && Number(reservation.advanceAmount) > 0 && (
                <tr className="text-green-600">
                  <td className="py-2">Advance Payment</td>
                  <td className="py-2">{reservation.paymentDate ? new Date(reservation.paymentDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-2 text-right">-${formatMoney(reservation.advanceAmount)}</td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t border-gray-200 font-semibold">
              <tr>
                <td colSpan={2} className="py-3 text-right">Total Due:</td>
                <td className="py-3 text-right">
                  ${formatMoney((reservation as any).remainingAmount ?? reservation.totalPrice)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Payment Terms:</h4>
          <p>Payment is due upon receipt. Please make checks payable to Hotel Reservation System.</p>
        </div>
      </div>
      
      <div className="text-center">
        <Link 
          to={`/reservations/${reservation.id}`} 
          className="text-blue-600 hover:underline flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Reservation
        </Link>
      </div>
    </div>
  );
};

export default InvoiceViewer;