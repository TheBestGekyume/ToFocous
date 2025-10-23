type CardProps = {
    title: string;
    color: string;
    number: number;
};

export const Card = ({ title, color, number }: CardProps) => {
    return (
        <div
            className={`flex justify-around gap-5 p-5
            border-1 rounded-xl 
        
        bg-${color}-500
        `}>

            <h4>{title}</h4>
            <p>{number}</p>
        </div>
    );
};
