/**
 * Lightweight tooltip renderer that can draw richly styled multi-line text to a canvas context.
 */
class TooltipText {
    /**
     * @param {Object} [options={}]
     * @param {number} [options.x=0]
     * @param {number} [options.y=0]
     * @param {string|function} [options.text=""]
     * @param {string} [options.font]
     * @param {string} [options.fillStyle]
     * @param {string} [options.strokeStyle]
     * @param {number} [options.lineWidth]
     * @param {CanvasTextAlign} [options.textAlign]
     * @param {CanvasTextBaseline} [options.textBaseline]
     * @param {string} [options.backgroundColor]
     * @param {number} [options.padding]
     * @param {number|null} [options.maxWidth]
     * @param {string} [options.shadowColor]
     * @param {number} [options.shadowBlur]
     * @param {number} [options.alpha=1]
     * @param {boolean} [options.isVisible=true]
     */
    constructor(options = {}) {
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.text = options.text ?? "";
        this.font = options.font ?? "24px \"Merriweather\", serif";
        this.fillStyle = options.fillStyle ?? "#ffffff";
        this.strokeStyle = options.strokeStyle ?? "rgba(0, 0, 0, 0.7)";
        this.lineWidth = options.lineWidth ?? 4;
        this.textAlign = options.textAlign ?? "left";
        this.textBaseline = options.textBaseline ?? "top";
        this.backgroundColor = options.backgroundColor ?? "rgba(0, 0, 0, 0.45)";
        this.padding = options.padding ?? 8;
        this.maxWidth = options.maxWidth ?? null;
        this.shadowColor = options.shadowColor ?? "rgba(0, 0, 0, 0.35)";
        this.shadowBlur = options.shadowBlur ?? 6;
        this.alpha = options.alpha ?? 1;
        this.isVisible = options.isVisible !== undefined ? options.isVisible : true;
        this.world = null;
    }

    /**
     * Resolves the current text, supporting either strings or functions that return text.
     *
     * @returns {string}
     */
    getText() {
        if (typeof this.text === "function") {
            return this.text(this);
        }
        return this.text;
    }

    /**
     * Updates the tooltip content.
     *
     * @param {string|function} nextText
     */
    setText(nextText) {
        this.text = nextText;
    }

    /**
     * Shows or hides the tooltip without destroying it.
     *
     * @param {boolean} isVisible
     */
    setVisible(isVisible) {
        this.isVisible = Boolean(isVisible);
    }

    /**
     * Draws the tooltip onto a canvas context using the configured styling.
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (!this.isVisible || !ctx) return;
        const lines = this.normalizeTextLines(this.getText());
        if (!lines.length) return;
        ctx.save();
        this.setupContext(ctx);
        const metrics = this.measureTextBlock(ctx, lines);
        const layout = this.computeLayout(metrics);
        this.drawBackgroundRect(ctx, metrics, layout);
        this.strokeLinesIfNeeded(ctx, lines, metrics.lineHeight, layout.rectY);
        this.fillLines(ctx, lines, metrics.lineHeight, layout.rectY);
        ctx.restore();
    }

    /**
     * Normalizes raw content into an array of plain-text lines.
     *
     * @param {string|undefined|null} content
     * @returns {string[]}
     */
    normalizeTextLines(content) {
        if (!content) return [];
        const normalized = String(content).replace(/\r\n/g, "\n").replace(/<br\s*\/?>/gi, "\n");
        return normalized ? normalized.split("\n") : [];
    }

    /**
     * Applies base context settings (alpha, font, alignment).
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    setupContext(ctx) {
        ctx.globalAlpha *= this.alpha;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
    }

    /**
     * Measures the text block to determine width, height, and line spacing.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {string[]} lines
     * @returns {{textWidth:number,lineHeight:number,textHeight:number,maxAscent:number,padding:number}}
     */
    measureTextBlock(ctx, lines) {
        const metrics = lines.map(line => ctx.measureText(line || " "));
        const textWidth = metrics.reduce((max, entry) => Math.max(max, entry.width), 0);
        const maxAscent = metrics.reduce(
            (max, entry) => Math.max(max, entry.actualBoundingBoxAscent ?? 0),
            0
        );
        const maxDescent = metrics.reduce(
            (max, entry) => Math.max(max, entry.actualBoundingBoxDescent ?? 0),
            0
        );
        const fallback = parseInt(this.font, 10) || 24;
        const lineHeight = maxAscent + maxDescent || fallback;
        return {
            textWidth,
            lineHeight,
            textHeight: lineHeight * lines.length,
            maxAscent,
            padding: typeof this.padding === "number" ? this.padding : 8,
        };
    }

    /**
     * Resolves the background rectangle placement based on alignment/baseline.
     *
     * @param {{textWidth:number,textHeight:number,maxAscent:number}} metrics
     * @returns {{rectX:number,rectY:number}}
     */
    computeLayout(metrics) {
        const rectX = this.resolveRectX(metrics.textWidth);
        const rectY = this.resolveRectY(metrics.textHeight, metrics.maxAscent);
        return { rectX, rectY };
    }

    /**
     * Computes the left edge of the tooltip rect based on alignment.
     *
     * @param {number} textWidth
     * @returns {number}
     */
    resolveRectX(textWidth) {
        if (this.textAlign === "center") return this.x - textWidth / 2;
        if (this.textAlign === "right" || this.textAlign === "end") return this.x - textWidth;
        return this.x;
    }

    /**
     * Computes the top edge of the tooltip rect based on baseline.
     *
     * @param {number} textHeight
     * @param {number} maxAscent
     * @returns {number}
     */
    resolveRectY(textHeight, maxAscent) {
        if (this.textBaseline === "middle") return this.y - textHeight / 2;
        if (this.textBaseline === "alphabetic" || this.textBaseline === "ideographic") {
            return this.y - maxAscent;
        }
        if (this.textBaseline === "bottom") return this.y - textHeight;
        return this.y;
    }

    /**
     * Renders the tooltip background if configured.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {{textWidth:number,textHeight:number,padding:number}} metrics
     * @param {{rectX:number,rectY:number}} layout
     */
    drawBackgroundRect(ctx, metrics, layout) {
        if (!this.backgroundColor) return;
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(
            layout.rectX - metrics.padding,
            layout.rectY - metrics.padding,
            metrics.textWidth + metrics.padding * 2,
            metrics.textHeight + metrics.padding * 2
        );
    }

    /**
     * Strokes each line when stroke settings are provided.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {string[]} lines
     * @param {number} lineHeight
     * @param {number} rectY
     */
    strokeLinesIfNeeded(ctx, lines, lineHeight, rectY) {
        if (!this.strokeStyle || this.lineWidth <= 0) return;
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.strokeStyle;
        ctx.textBaseline = "top";
        let lineY = rectY;
        lines.forEach(line => {
            ctx.strokeText(line, this.x, lineY, this.maxWidth ?? undefined);
            lineY += lineHeight;
        });
    }

    /**
     * Fills each line of text using the configured fill/shadow styles.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {string[]} lines
     * @param {number} lineHeight
     * @param {number} rectY
     */
    fillLines(ctx, lines, lineHeight, rectY) {
        ctx.shadowColor = this.shadowColor;
        ctx.shadowBlur = this.shadowBlur;
        ctx.fillStyle = this.fillStyle;
        ctx.textBaseline = "top";
        let lineY = rectY;
        lines.forEach(line => {
            ctx.fillText(line, this.x, lineY, this.maxWidth ?? undefined);
            lineY += lineHeight;
        });
    }
}
