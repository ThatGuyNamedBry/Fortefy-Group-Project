import React, { useLayoutEffect, useRef, useState } from 'react';
import './Carousel.css';

/**
 * Horizontal card carousel with paging arrows.
 *
 * The row is filled edge to edge: it fits as many cards as it can (each at
 * least `minCardWidth` wide) and stretches them to use up the remaining space,
 * so the arrows always sit flush with the right edge of the last card.
 * Clicking an arrow slides the track one full page at a time.
 */
const Carousel = ({
    title,
    titleAddon = null,
    items,
    renderItem,
    getKey = (item, index) => (item && item.id != null ? item.id : index),
    minCardWidth = 180,
    gap = 17,
    className = '',
}) => {
    const viewportRef = useRef(null);
    const [viewportWidth, setViewportWidth] = useState(0);
    const [startIndex, setStartIndex] = useState(0);

    // Measure the visible row so the card count/size can follow the window.
    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return undefined;

        const measure = () => setViewportWidth(viewport.clientWidth);
        measure();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }

        const observer = new ResizeObserver(measure);
        observer.observe(viewport);
        return () => observer.disconnect();
    }, []);

    const perPage = Math.max(1, Math.floor((viewportWidth + gap) / (minCardWidth + gap)));
    const cardWidth = viewportWidth > 0
        ? (viewportWidth - (perPage - 1) * gap) / perPage
        : minCardWidth;

    // Clamp so the last page is always full, and so we recover if the item
    // list shrinks or the window grows while we are scrolled to the end.
    const maxStart = Math.max(0, items.length - perPage);
    const start = Math.min(startIndex, maxStart);
    const canGoPrev = start > 0;
    const canGoNext = start < maxStart;

    const goPrev = () => setStartIndex(Math.max(0, start - perPage));
    const goNext = () => setStartIndex(Math.min(maxStart, start + perPage));

    const offset = Math.round(start * (cardWidth + gap));

    return (
        <section className={`carousel ${className}`.trim()}>
            <div className="carousel-header">
                <div className="carousel-title">
                    <h2>{title}</h2>
                    {titleAddon}
                </div>
                <div className="carousel-arrows">
                    <button
                        type="button"
                        className="carousel-arrow"
                        onClick={goPrev}
                        disabled={!canGoPrev}
                        aria-label={`Previous ${title}`}
                    >
                        <i className="fa-solid fa-angles-left" />
                    </button>
                    <button
                        type="button"
                        className="carousel-arrow"
                        onClick={goNext}
                        disabled={!canGoNext}
                        aria-label={`Next ${title}`}
                    >
                        <i className="fa-solid fa-angles-right" />
                    </button>
                </div>
            </div>
            <div className="carousel-viewport" ref={viewportRef}>
                <div
                    className="carousel-track"
                    style={{ gap: `${gap}px`, transform: `translateX(${-offset}px)` }}
                >
                    {items.map((item, index) => (
                        <div
                            key={getKey(item, index)}
                            className="carousel-slide"
                            style={{ flex: `0 0 ${cardWidth}px` }}
                        >
                            {renderItem(item, index)}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Carousel;
