interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
}

const paddingMap = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
};

export function Card({ children, variant = 'default', padding = 'md', className = '' }: CardProps) {
    const variantStyles = {
        default: 'bg-gray-800 border border-gray-700',
        glass: 'bg-white/5 backdrop-blur-md border border-white/10',
        elevated: 'bg-gray-800 shadow-xl shadow-black/20 border border-gray-700',
    };

    return (
        <div className={`rounded-2xl ${variantStyles[variant]} ${paddingMap[padding]} ${className}`}>
            {children}
        </div>
    );
}