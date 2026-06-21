import React from 'react';

interface AIReflectionCardProps {
  aiReflection: string;
}

export function AIReflectionCard({ aiReflection }: AIReflectionCardProps) {
  // Parse the emoji-prefixed sections
  const sections = aiReflection.split('\n').filter(line => line.trim());
  
  // If no emojis found, try to split by sentences for fallback
  const parsedSections = sections.length >= 3 
    ? sections 
    : aiReflection.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [aiReflection];

  const getEmoji = (text: string, index: number) => {
    if (text.includes('💭')) return '💭';
    if (text.includes('🌱')) return '🌱';
    if (text.includes('✨')) return '✨';
    return ['💭', '🌱', '✨'][index] || '💭';
  };

  const getLabel = (index: number) => {
    return ['Feeling seen', 'The reframe', 'Tiny step'][index] || 'Reflection';
  };

  const getGradient = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #F7EEEE 0%, #F0E2DF 100%)',
      'linear-gradient(135deg, #E8F0F0 0%, #C4DEDF 100%)',
      'linear-gradient(135deg, #F2E8E4 0%, #E2D7C2 100%)',
    ];
    return gradients[index] || gradients[0];
  };

  const getBorderColor = (index: number) => {
    return ['#CF6F85', '#C4DEDF', '#959863'][index] || '#CF6F85';
  };

  const getLabelColor = (index: number) => {
    return ['#B85D73', '#576154', '#6F7248'][index] || '#B85D73';
  };

  const getLabelBg = (index: number) => {
    return ['rgba(207, 111, 133, 0.14)', 'rgba(196, 222, 223, 0.4)', 'rgba(149, 152, 99, 0.18)'][index] || 'rgba(207, 111, 133, 0.14)';
  };

  const getBoldColor = (index: number) => {
    return ['#B85D73', '#576154', '#6F7248'][index] || '#B85D73';
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{
        fontSize: '15px',
        fontWeight: 700,
        color: '#3F473D',
        margin: '0 0 16px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{
          display: 'inline-block',
          animation: 'gentleBounce 2s ease-in-out infinite',
        }}>✨</span>
        AI Balanced Reflection
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {parsedSections.slice(0, 3).map((section, i) => {
          const cleanText = section.replace(/[💭🌱✨]/g, '').trim();
          const emoji = getEmoji(section, i);
          const label = getLabel(i);
          
          return (
            <div
              key={i}
              style={{
                background: getGradient(i),
                borderRadius: '20px',
                padding: '16px 20px',
                boxShadow: '0 2px 12px rgba(87, 97, 84, 0.08)',
                border: `2px solid ${getBorderColor(i)}`,
                transition: 'all 0.3s ease',
                marginLeft: `${i * 12}px`,
                position: 'relative',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(207, 111, 133, 0.16)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(87, 97, 84, 0.08)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{emoji}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: getLabelColor(i),
                  background: getLabelBg(i),
                  padding: '3px 10px',
                  borderRadius: '12px',
                }}>
                  {label}
                </span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#3F473D',
                fontWeight: 500,
              }}>
                {cleanText.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={idx} style={{ color: getBoldColor(i) }}>
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return <span key={idx}>{part}</span>;
                })}
              </p>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
