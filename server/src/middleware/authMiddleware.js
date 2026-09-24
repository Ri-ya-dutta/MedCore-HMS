import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                message: "Invalid authorization header",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};