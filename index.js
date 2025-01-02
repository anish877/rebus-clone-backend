import Groq from "groq-sdk/index.mjs";
import e from "express"
import cors from "cors"

const app = e()
const port = 3000
app.use(e.json())
app.use(cors())

export async function generateBusRoutes(origin, destination) {
    const groq = new Groq({
        apiKey: "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"
    });

    const prompt = `Generate a JSON array of 5 bus routes between ${origin} and ${destination}. Each route should have the following structure:
    {
        companyName: string,
        busName: string,
        departureTime: string (HH:mm format),
        durationTime: string (XXh YYm format),
        destination: string,
        arrivalTime: string (HH:mm format),
        pickUpPoint: string,
        rating: string (X.X format),
        fare: string,
        seatsAvailable: string,
        busType: string (one of: "SLEEPER", "SEATER", "SEMI_SLEEPER"),
        singleSeats: boolean
    }
    Return only the JSON array without any additional text or explanation.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: prompt
            }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1000
        });

        const generatedContent = completion.choices[0]?.message?.content || "";
        const routes = JSON.parse(generatedContent);

        // Validate the data structure
        const validatedRoutes = routes.map(route => ({
            companyName: String(route.companyName),
            busName: String(route.busName),
            departureTime: String(route.departureTime),
            durationTime: String(route.durationTime),
            destination: String(route.destination),
            arrivalTime: String(route.arrivalTime),
            pickUpPoint: String(route.pickUpPoint),
            rating: String(route.rating),
            fare: String(route.fare),
            seatsAvailable: String(route.seatsAvailable),
            busType: String(route.busType),
            singleSeats: Boolean(route.singleSeats)
        }));

        return validatedRoutes;
    } catch (error) {
        console.error('Error generating bus routes:', error);
        throw error;
    }
}
app.get("/getRoutes",async (req,res)=>{
    const {origin,destination} = req.query
    console.log(origin,destination)
    try {
        const routes = await generateBusRoutes(origin, destination);
        console.log(routes)
        res.status(200).json({routes})
    } catch (error) {
        console.error('Error in main:', error);
        res.status(500).json({message: "Internal server error"})
    }
})
app.listen(port,()=>{
    console.log("Server started at port " + port)
})
