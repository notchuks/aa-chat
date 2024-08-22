import React, { useEffect, useRef } from "react";

export default function ScrollableBox({ children, className }: { children: React.ReactNode, className: string }) {
    const container = useRef<HTMLDivElement>(null);

    const Scroll = () => {
        const { offsetHeight, scrollHeight, scrollTop } = container.current as HTMLDivElement;
        if (scrollHeight <=  scrollTop + offsetHeight) {
            container.current?.scrollTo(0, scrollHeight);
        }
    }

    useEffect(() => {
        Scroll();
    }, [children])

    return <div className={className} ref={container}><div className='flex shrink grow' /><div >{children}</div></div>
}