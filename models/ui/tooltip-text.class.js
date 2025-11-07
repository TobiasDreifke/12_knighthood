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

        ctx.save();
        ctx.globalAlpha *= this.alpha;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;

        const metrics = ctx.measureText(content);
        const textWidth = metrics.width;
        const ascent = metrics.actualBoundingBoxAscent ?? 0;
        const descent = metrics.actualBoundingBoxDescent ?? 0;
        const textHeight = ascent + descent || parseInt(this.font, 10) || 24;
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
            rectY = this.y - ascent;
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
        if (this.strokeStyle && this.lineWidth > 0) {
            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = this.strokeStyle;
            ctx.strokeText(content, this.x, this.y, this.maxWidth ?? undefined);
        }
        ctx.fillText(content, this.x, this.y, this.maxWidth ?? undefined);
        ctx.restore();
    }
}
