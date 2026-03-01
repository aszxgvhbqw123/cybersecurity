
import { Course, User } from '../types';

// Simplified SVG string for the M-Sec logo, used on the certificate.
const logoSvgString = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00BFFF" />
      <stop offset="100%" stop-color="#00FF7F" />
    </linearGradient>
  </defs>
  <path d="M20 90 L20 10 L40 10 L50 40 L60 10 L80 10 L80 90 L65 90 L65 45 L55 75 L45 75 L35 45 L35 90 Z" fill="url(#logoGrad)" />
</svg>
`;

export const generateCertificate = (user: User, course: Course): void => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error("Could not get canvas context");
        return;
    }

    // Background
    ctx.fillStyle = '#1A1A1A'; // secondary color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#00BFFF'; // accent blue
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Load the logo as an image
    const logoImg = new Image();
    const svgBlob = new Blob([logoSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    logoImg.onload = () => {
        // Draw all text content after the logo has loaded to ensure proper layering
        ctx.drawImage(logoImg, 50, 40, 100, 100);

        // Title
        ctx.font = 'bold 60px Inter, sans-serif';
        ctx.fillStyle = '#E0E0E0'; // text-primary
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Completion', canvas.width / 2, 180);

        // Subtitle
        ctx.font = '30px Inter, sans-serif';
        ctx.fillStyle = '#A0A0A0'; // text-secondary
        ctx.fillText('This certificate is proudly presented to', canvas.width / 2, 280);
        
        // User Name
        ctx.font = 'italic bold 70px Inter, sans-serif';
        ctx.fillStyle = '#00FF7F'; // accent-green
        ctx.fillText(user.name, canvas.width / 2, 380);

        // Course Info
        ctx.font = '30px Inter, sans-serif';
        ctx.fillStyle = '#A0A0A0';
        ctx.fillText('for successfully completing the course', canvas.width / 2, 480);
        
        ctx.font = 'bold 40px Inter, sans-serif';
        ctx.fillStyle = '#E0E0E0';
        ctx.fillText(`"${course.title}"`, canvas.width / 2, 550);
        
        // Date
        const completionDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        ctx.font = '24px Inter, sans-serif';
        ctx.fillStyle = '#A0A0A0';
        ctx.fillText(`Date: ${completionDate}`, canvas.width / 2, 650);

        // Signature/Brand
        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.fillStyle = '#00BFFF';
        ctx.textAlign = 'left';
        ctx.fillText('M-Sec Platform', 150, 720);
        ctx.strokeStyle = '#A0A0A0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(150, 680);
        ctx.lineTo(450, 680);
        ctx.stroke();

        // Clean up the object URL
        URL.revokeObjectURL(url);
        
        // Trigger download
        const link = document.createElement('a');
        link.download = `M-Sec_Certificate_${course.title.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    
    logoImg.onerror = () => {
        console.error("Failed to load logo SVG for certificate.");
        URL.revokeObjectURL(url);
    };

    logoImg.src = url;
};
