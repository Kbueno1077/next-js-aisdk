# Why I’m Sharing This

While looking for resources on building AI-powered apps quickly—mainly using Vercel’s AI SDK—I came across tons of video tutorials on YouTube, plus some excellent official documentation. That made me think: this is a perfect way to introduce people to what might otherwise feel like a daunting space.

My idea was simple: build as many small AI features as possible to see what’s doable, how long it takes, and how much code is really required for functional demos. Turns out, you can achieve _a lot_ with minimal code and in very little time.

This isn’t a production app or anything serious—it’s me experimenting with AI, testing ideas, and having fun with the UI. The result was a small demo project: [check it out here](https://ai-sdk-demo-playground.vercel.app/).

## 🔧 Structured Output (Surprisingly Practical)

This is probably the most useful feature. Instead of just receiving random text from an AI, you can ask it to return structured data.

Want a recipe? You’ll get back a title, an ingredient list, and clear instructions. Need a list of Pokémon? You’ll get an array of objects with names, types, and stats.

It’s like working with an AI that actually _understands_ what you’re asking for and formats the response so you can use it right away.

## 🌐 External Tools (Where the Magic Happens)

Here’s where things get really fun. I hooked up a weather API so you can ask, “What’s the weather like in Tokyo?”—and the AI fetches real data.

With web search and other APIs, you can combine services to give your AI new abilities. It’s essentially like giving your app superpowers.

## How I Built It

### The Tech Stack

Pretty standard these days:

- **Next.js 15**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui**
- **Zod** (key for validating structured responses)
- **Vercel AI SDK v5** (the star of the show, handling all the AI work)
- **Arcjet** (for security—bot detection, rate limiting—so I don’t go broke from demo abuse)

---

### The Architecture

The setup is simple. Each feature has its own API route in `app/api/`:

- Chat in one
- Image generation in another
- Tools in another

The UI follows the same pattern: each feature gets its own playground page, where you can also see the minimal code powering it.

The AI SDK does most of the heavy lifting. For example:

- `useChat()` handles chat interactions
- `useCompletion()` covers text generation

It also manages streaming, state, and more—leaving me surprised at how little code was needed.

### Why Structured Output Changes Everything

Plain text is fine for chat, but structured data is far more useful for real apps. For example:

```typescript
const { completion } = await streamText({
  model: openai("gpt-5"),
  schema: z.object({
    title: z.string(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
  }),
  prompt: "Give me a cookie recipe",
});
```

Instead of a text blob, you now get a clean object with fields you can immediately use.

---

## Tools Make It Interesting

Connecting external services opens the door to much more powerful use cases. For example:

```typescript
const { messages } = useChat({
  api: "/api/tools",
  tools: {
    getWeather: {
      description: "Get weather for a location",
      parameters: z.object({
        location: z.string(),
      }),
    },
  },
});
```

With this, the AI can fetch the weather, perform searches, call APIs—you decide what powers to grant it.

## The Good

This approach is fantastic for prototyping. You can spin up features quickly, experiment with ideas, and learn a lot about how modern apps are built.

Even better: Vercel’s AI SDK standardizes the way you work with LLMs, letting you switch providers seamlessly while keeping the same API.

## The Not-So-Good

The abstraction is powerful, but it can also shield you from understanding how LLMs work under the hood. It’s worth spending time learning how to interact with models directly, even if you’ll likely use frameworks like this in production. That deeper knowledge pays off.

## Extra

I didn’t use them in my demo, but Vercel also offers a set of prebuilt components for AI chatbot-style apps: [Vercel AI Elements](https://ai-sdk.dev/elements/overview). Definitely worth exploring if you want to speed things up even further.

---
