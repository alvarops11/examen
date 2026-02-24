import { useEffect } from "react";

interface SEOProps {
    title?: string;
    description?: string;
    canonicalPath?: string;
    jsonLd?: object;
}

const DEFAULT_TITLE = "Generador de exámenes tipo test con IA | ExamSphere";
const DEFAULT_DESCRIPTION = "Crea exámenes tipo test con IA a partir de tus apuntes en segundos. Personaliza dificultad, número de preguntas y temas. Ideal para estudiar y repasar mejor.";
const BASE_URL = "https://examsphere.me";

export default function SEO({ title, description, canonicalPath, jsonLd }: SEOProps) {
    useEffect(() => {
        // Update title
        document.title = title ? `${title} | ExamSphere` : DEFAULT_TITLE;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", description || DEFAULT_DESCRIPTION);
        }

        // Update canonical link
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        const url = canonicalPath ? `${BASE_URL}${canonicalPath}` : BASE_URL;

        if (canonicalLink) {
            canonicalLink.setAttribute("href", url);
        } else {
            canonicalLink = document.createElement("link");
            canonicalLink.setAttribute("rel", "canonical");
            canonicalLink.setAttribute("href", url);
            document.head.appendChild(canonicalLink);
        }

        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute("content", title ? `${title} | ExamSphere` : DEFAULT_TITLE);

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) ogDescription.setAttribute("content", description || DEFAULT_DESCRIPTION);

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute("content", url);

        // Update JSON-LD
        let scriptTag = document.querySelector('script[type="application/ld+json"]');
        if (jsonLd) {
            if (scriptTag) {
                scriptTag.textContent = JSON.stringify(jsonLd);
            } else {
                scriptTag = document.createElement("script");
                scriptTag.setAttribute("type", "application/ld+json");
                scriptTag.textContent = JSON.stringify(jsonLd);
                document.head.appendChild(scriptTag);
            }
        } else if (scriptTag) {
            scriptTag.remove();
        }

    }, [title, description, canonicalPath, jsonLd]);

    return null;
}
