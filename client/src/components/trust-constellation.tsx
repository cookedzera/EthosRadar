import { useEffect, useRef, useState, memo } from "react";
import { Star, Users, Zap, Award, Crown, Shield, AlertTriangle } from "lucide-react";

interface ConstellationNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  brightness: number;
  color: string;
  user: {
    userkey: string;
    displayName: string;
    username: string;
    avatarUrl: string;
    score: number;
    tier: string;
  };
  connections: string[];
  isMainUser: boolean;
  pulse: number;
}

interface ConstellationConnection {
  from: string;
  to: string;
  strength: number;
  amount: number;
  type: 'vouch' | 'review';
  color: string;
  animated: boolean;
}

interface TrustConstellationProps {
  user: any;
  vouchData?: any;
  realStats?: any;
  className?: string;
}

const getTierInfo = (score: number) => {
  if (score >= 2000) return { 
    icon: Crown, 
    tier: 'Exemplary',
    color: '#8b5cf6',
    brightness: 1.0
  };
  if (score >= 1600) return { 
    icon: Award, 
    tier: 'Reputable',
    color: '#10b981',
    brightness: 0.85
  };
  if (score >= 1200) return { 
    icon: Zap, 
    tier: 'Neutral',
    color: '#3b82f6',
    brightness: 0.7
  };
  if (score >= 800) return { 
    icon: AlertTriangle, 
    tier: 'Questionable',
    color: '#f59e0b',
    brightness: 0.5
  };
  return { 
    icon: Shield, 
    tier: 'Untrusted',
    color: '#6b7280',
    brightness: 0.3
  };
};

export const TrustConstellation = memo(({ user, vouchData, realStats, className = "" }: TrustConstellationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<ConstellationNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null);
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [connections, setConnections] = useState<ConstellationConnection[]>([]);
  const animationRef = useRef<number>();

  // Generate constellation data from vouch/review data
  useEffect(() => {
    if (!user || !vouchData || !vouchData.success || !vouchData.data) return;

    const newNodes: ConstellationNode[] = [];
    const newConnections: ConstellationConnection[] = [];
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;

    // Main user at center
    const mainUserTier = getTierInfo(user.score || 0);
    const mainNode: ConstellationNode = {
      id: user.userkeys?.[0] || 'main',
      x: centerX,
      y: centerY,
      radius: 8,
      brightness: mainUserTier.brightness,
      color: mainUserTier.color,
      user: {
        userkey: user.userkeys?.[0] || '',
        displayName: user.displayName || 'You',
        username: user.username || '',
        avatarUrl: user.avatarUrl || '',
        score: user.score || 0,
        tier: mainUserTier.tier
      },
      connections: [],
      isMainUser: true,
      pulse: 0
    };
    newNodes.push(mainNode);

    // Add connected users from vouch data
    const connectedUsers = new Map<string, any>();
    
    // Process received vouches - use voucherInfo (person who vouched for us)
    const receivedVouches = vouchData.data.received || [];
    receivedVouches.forEach((vouch: any) => {
      if (vouch.voucherInfo && vouch.voucherInfo.userkey) {
        connectedUsers.set(vouch.voucherInfo.userkey, {
          ...vouch.voucherInfo,
          vouchAmount: parseFloat(vouch.amountEth || vouch.amount || '0'),
          relationship: 'received',
          vouchData: vouch
        });
      }
    });

    // Process given vouches - use voucheeInfo (person we vouched for)
    const givenVouches = vouchData.data.given || [];
    givenVouches.forEach((vouch: any) => {
      if (vouch.voucheeInfo && vouch.voucheeInfo.userkey) {
        const existing = connectedUsers.get(vouch.voucheeInfo.userkey);
        connectedUsers.set(vouch.voucheeInfo.userkey, {
          ...(existing || vouch.voucheeInfo),
          vouchAmount: (existing?.vouchAmount || 0) + parseFloat(vouch.amountEth || vouch.amount || '0'),
          relationship: existing ? 'mutual' : 'given',
          vouchData: vouch
        });
      }
    });

    // Debug logging
    console.log('🌌 Constellation: Generated network with', connectedUsers.size, 'unique connections');

    // Create nodes for connected users - LIMIT TO TOP CONNECTIONS ONLY
    const userArray = Array.from(connectedUsers.values());
    
    // Sort by importance: mutual > received > given, then by score
    const sortedUsers = userArray.sort((a, b) => {
      // Priority: mutual vouches first
      if (a.relationship === 'mutual' && b.relationship !== 'mutual') return -1;
      if (b.relationship === 'mutual' && a.relationship !== 'mutual') return 1;
      
      // Then by score (higher score = more important)
      return (b.score || 0) - (a.score || 0);
    });

    // LIMIT: Show only top 8 most important connections for clarity
    const topConnections = sortedUsers.slice(0, 8);
    
    if (topConnections.length === 0) {
      // Show a simple message if no connections
      console.log('🌌 Constellation: No meaningful connections to display');
    } else {
      // Process top connections with clean layout
      topConnections.forEach((connectedUser, index) => {
        const angle = (2 * Math.PI * index) / topConnections.length;
        const baseDistance = 80; // Fixed distance for clean layout
        const tier = getTierInfo(connectedUser.score || 1200);
        
        const node: ConstellationNode = {
          id: connectedUser.userkey,
          x: centerX + Math.cos(angle) * baseDistance,
          y: centerY + Math.sin(angle) * baseDistance,
          radius: 6 + (tier.brightness * 2), // Larger, more visible stars
          brightness: tier.brightness,
          color: tier.color,
          user: {
            userkey: connectedUser.userkey,
            displayName: connectedUser.displayName || connectedUser.username || 'Unknown',
            username: connectedUser.username || '',
            avatarUrl: connectedUser.avatarUrl || '',
            score: connectedUser.score || 1200,
            tier: tier.tier
          },
          connections: [mainNode.id],
          isMainUser: false,
          pulse: Math.random() * Math.PI * 2
        };
        
        newNodes.push(node);
        
        // Create connection with clean styling
        const connection: ConstellationConnection = {
          from: mainNode.id,
          to: node.id,
          strength: tier.brightness,
          amount: connectedUser.vouchAmount || 0,
          type: 'vouch',
          color: tier.color,
          animated: connectedUser.relationship === 'mutual'
        };
        
        newConnections.push(connection);
        mainNode.connections.push(node.id);
      });
    }

    // Final constellation generated

    setNodes(newNodes);
    setConnections(newConnections);
  }, [user, vouchData, realStats]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const animate = () => {
      time += 0.02;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections first
      connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        
        if (fromNode && toNode) {
          ctx.strokeStyle = conn.color + '40';
          ctx.lineWidth = 1 + conn.strength * 2;
          
          if (conn.animated) {
            // Animated dashed line for mutual vouches
            const dashOffset = time * 20;
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = dashOffset;
          } else {
            ctx.setLineDash([]);
          }
          
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const pulseScale = node.isMainUser ? 
          1 + Math.sin(time * 3) * 0.1 : 
          1 + Math.sin(time * 2 + node.pulse) * 0.05;
        
        const radius = node.radius * pulseScale;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, radius * 2
        );
        gradient.addColorStop(0, node.color + '80');
        gradient.addColorStop(1, node.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Main star
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright center
        ctx.fillStyle = '#ffffff' + Math.floor(node.brightness * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight main user
        if (node.isMainUser) {
          ctx.strokeStyle = '#ffffff80';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, connections]);

  // Handle mouse interactions
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hoveredNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.radius + 5;
    });

    setHoveredNode(hoveredNode || null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.radius + 5;
    });

    setSelectedNode(clickedNode || null);
  };

  const stats = {
    totalConnections: nodes.length - 1, // Showing top connections only
    mutualVouches: connections.filter(c => c.animated).length,
    networkReach: Math.min(8, nodes.length - 1) // Max 8 displayed
  };

  return (
    <div className={`bg-gray-100/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border-0 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
          <Star className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Trust Constellation</h3>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full h-auto bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl border border-gray-200"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          data-testid="constellation-canvas"
        />
        
        {/* Hover tooltip */}
        {hoveredNode && !hoveredNode.isMainUser && (
          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded-lg pointer-events-none">
            <div className="font-semibold">{hoveredNode.user.displayName}</div>
            <div className="text-gray-300">Score: {hoveredNode.user.score}</div>
            <div className="text-gray-300">Tier: {hoveredNode.user.tier}</div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{stats.totalConnections}</div>
          <div className="text-xs text-gray-600">Top Shown</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{stats.mutualVouches}</div>
          <div className="text-xs text-gray-600">Mutual</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-600">{vouchData?.success && vouchData.data ? (vouchData.data.received?.length || 0) + (vouchData.data.given?.length || 0) : 0}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-600 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Exemplary</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Reputable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Neutral</span>
          </div>
        </div>
      </div>
    </div>
  );
});

TrustConstellation.displayName = 'TrustConstellation';