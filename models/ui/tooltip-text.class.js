class TooltipText {
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

    getText() {
        if (typeof this.text === "function") {
            return this.text(this);
        }
        return this.text;
    }

    setText(nextText) {
        this.text = nextText;
    }

    setVisible(isVisible) {
        this.isVisible = Boolean(isVisible);
    }

    draw(ctx) {
        if (!this.isVisible) return;
        if (!ctx) return;
        const content = this.getText();
        if (!content) return;
        const normalizedText = String(content)
            .replace(/\r\n/g, "\n")
            .replace(/<br\s*\/?>/gi, "\n");
        const lines = normalizedText.split("\n");
        if (!lines.length) return;

        ctx.save();
        ctx.globalAlpha *= this.alpha;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;

        const metricsPerLine = lines.map((line) => ctx.measureText(line || " "));
        const textWidth = metricsPerLine.reduce((max, metrics) => Math.max(max, metrics.width), 0);
        const maxAscent = metricsPerLine.reduce(
            (max, metrics) => Math.max(max, metrics.actualBoundingBoxAscent ?? 0),
            0
        );
        const maxDescent = metricsPerLine.reduce(
            (max, metrics) => Math.max(max, metrics.actualBoundingBoxDescent ?? 0),
            0
        );
        const fallbackLineHeight = parseInt(this.font, 10) || 24;
        const lineHeight = maxAscent + maxDescent || fallbackLineHeight;
        const textHeight = lineHeight * lines.length;
        const padding = typeof this.padding === "number" ? this.padding : 8;

        let rectX = this.x;
        if (this.textAlign === "center") {
            rectX = this.x - textWidth / 2;
        } else if (this.textAlign === "right" || this.textAlign === "end") {
            rectX = this.x - textWidth;
        }

        let rectY = this.y;
        if (this.textBaseline === "middle") {
            rectY = this.y - textHeight / 2;
        } else if (this.textBaseline === "alphabetic" || this.textBaseline === "ideographic") {
            rectY = this.y - maxAscent;
        } else if (this.textBaseline === "bottom") {
            rectY = this.y - textHeight;
        }

        if (this.backgroundColor) {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(
                rectX - padding,
                rectY - padding,
                textWidth + padding * 2,
                textHeight + padding * 2
            );
        }

        ctx.shadowColor = this.shadowColor;
        ctx.shadowBlur = this.shadowBlur;
        ctx.fillStyle = this.fillStyle;
        ctx.textBaseline = "top";
        let lineY = rectY;
        if (this.strokeStyle && this.lineWidth > 0) {
            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = this.strokeStyle;
            lines.forEach((line) => {
                ctx.strokeText(line, this.x, lineY, this.maxWidth ?? undefined);
                lineY += lineHeight;
            });
            lineY = rectY;
        }
        lines.forEach((line) => {
            ctx.fillText(line, this.x, lineY, this.maxWidth ?? undefined);
            lineY += lineHeight;
        });
        ctx.restore();
    }
}
