// ABOUTME: Script to enrich thin blog post content
// ABOUTME: Updates posts with more robust, engaging content

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const enrichedContent: Record<string, string> = {
  // Searching for kitty
  cmi2tcanw00ux8zpwworx0v9c: `Back in the winter I photographed my friend Melissa at Mount Diablo. The story is about a young girl who lost her kitty. She goes on a quest to locate her lost friend.

## The Concept

This project is part of my Rescue Tales series, where I combine storytelling with photography to create narrative images that tug at the heartstrings. The idea came to me one foggy morning while hiking the trails of Mount Diablo—the mysterious atmosphere was perfect for a tale of loss and hope.

## Behind the Scenes

Melissa was incredible to work with. We spent the early morning hours exploring different locations on the mountain, from the misty meadows to the weathered oak trees. The natural fog added an ethereal quality that you simply can't replicate with artificial effects.

## The Story

In this visual narrative, a young girl searches through forests and fields, calling out for her beloved cat. Each image captures a different moment in her journey—the initial worry, the determination, and finally, the hopeful anticipation of reunion. It's a story that resonates with anyone who has ever loved a pet.

The golden morning light breaking through the fog created these beautiful, painterly scenes that perfectly matched the fairytale quality I was going for. Sometimes the best photography happens when you work with what nature gives you rather than fighting against it.`,

  // Swinging Away
  cmi2taffu00sw8zpwhvjd8q3t: `This weekend I visited with my cousins and their adorable children at a family BBQ. I love photographing them—they have great energy and always have fun!

## Capturing Authentic Joy

There's something magical about photographing children at play. Unlike posed studio shots, these candid moments capture genuine emotion and personality. The kids were absolutely loving the swing set, and I couldn't resist grabbing my camera.

## Technical Notes

For action shots like these, I shoot in continuous focus mode with a fast shutter speed (usually 1/1000 or faster) to freeze the motion. The late afternoon light was streaming through the trees, creating beautiful rim lighting around their hair and adding that warm, nostalgic feel to the images.

## Why I Love Lifestyle Photography

Family gatherings are full of fleeting moments—the belly laughs, the spontaneous hugs, the determined faces of kids mastering new skills. These are the memories that families treasure most, and I feel honored to preserve them.

My advice to parents: don't wait for the "perfect" moment to document your family. The imperfect, everyday moments are often the ones you'll cherish most as your children grow.`,

  // Sarah+Dave Wedding
  cmi2ta0t500sd8zpwswx05gth: `This summer my best friend Sarah got married to Dave. I was so honored to be maid of honor along with our other best friend Ashley. Congrats S+D!

## A Day Full of Love

Being both a bridesmaid and photographer is always a delicate balance, but for Sarah, I wouldn't have had it any other way. Their wedding was intimate, joyful, and filled with personal touches that made it uniquely them.

## The Venue

They chose a stunning outdoor venue that perfectly captured their personalities—modern yet warm, elegant yet approachable. The natural light during golden hour was absolutely divine, painting everything in that soft, romantic glow that every bride dreams of.

## Favorite Moments

There were so many beautiful moments throughout the day, but a few stand out: the way Dave's face lit up when he first saw Sarah walking down the aisle, their grandparents dancing together at the reception, and the quiet moment they stole away to watch the sunset as newlyweds.

## The Gift of Friendship

Photographing the wedding of someone you love deeply is a gift. You know exactly when they're about to laugh, cry, or share a knowing glance. You understand the inside jokes and the family dynamics. It's this intimate knowledge that helps capture not just the events of the day, but the true essence of the couple.

To Sarah and Dave: thank you for letting me be part of your day. Here's to a lifetime of love and adventure!`,

  // My Sister's Prom
  cmi2t5hhb00nx8zpw0m10s7nz: `My kid sister just went to her first prom! I was delighted to take a few pictures of her and her boyfriend. I saw so many beautiful dresses. What a fun time in their lives!

## A Milestone Moment

Prom is one of those milestone events that marks the transition from childhood to young adulthood. Watching my baby sister get ready, I couldn't help but feel a mix of pride and nostalgia. Where did the time go?

## The Photo Session

We had about 30 minutes before the group needed to leave, so I worked quickly to capture the essential shots: individual portraits, couple photos, and of course, the classic corsage-pinning moment. I kept things casual and fun—the last thing you want is stressed-out teens right before their big night!

## Location and Lighting

We shot in our backyard garden, which offered beautiful natural backdrops. The late afternoon sun provided gorgeous golden light, and I positioned them to get that lovely rim light in their hair. Pro tip: always shoot prom photos at least an hour before sunset for the most flattering light.

## Dress Details

Sydney's dress was absolutely stunning—the beading caught the light beautifully, and the color complemented her skin tone perfectly. I made sure to capture some detail shots of the dress, accessories, and boutonnieres. These little details matter and are often forgotten in the excitement of the evening.

Prom only happens once (or twice!), and I'm so glad I could capture these memories for my sister.`,

  // Sydney at Tilden
  cmi2sz2kd00hy8zpw02u95k85: `My baby sister is a senior and going off to college next year. Where did the time go?! This fall we explored Tilden Botanical Garden and made our way to Grizzly Peak for sunset.

## Senior Portrait Season

Senior portraits are such a special genre of photography. It's a celebration of accomplishment and a snapshot of who someone is at this pivotal moment in their life. For my sister Sydney, I wanted to create images that captured her personality—adventurous, creative, and effortlessly cool.

## Location Scouting

Tilden Botanical Garden is one of the East Bay's hidden gems. The variety of landscapes within a relatively small area makes it perfect for portrait sessions. We moved from the succulent garden to the redwood grove to the meadow, getting completely different looks without traveling far.

## The Golden Hour Magic

After exploring the gardens, we drove up to Grizzly Peak just as the sun was beginning to set. The view of the Bay Area from up there is spectacular, and the golden light transformed everything it touched. We captured some of my favorite images of the day against that backdrop.

## Working with Family

Photographing family can be tricky—there's a comfort level that can work for or against you. With Sydney, we've developed a great working relationship over the years. She trusts my direction, and I know exactly how to make her laugh when she gets too in her head.

To my baby sis: I'm so proud of you and can't wait to see where your next adventure takes you. The world better watch out!`,

  // Sarah Maternity
  cmi2sujyl00eb8zpwvum74147: `My best friend is due any day now and I'm so excited for her. She radiates love and warmth. We explored the UC Berkeley Botanical Gardens. It was a gorgeous day! Welcome soon baby, we love you so much already.

## Capturing the Anticipation

Maternity photography is about capturing that beautiful, fleeting moment of anticipation—the quiet joy before life changes forever. Sarah has this incredible glow about her, and I wanted our session to reflect the peace and happiness she's feeling.

## Why I Love the Botanical Gardens

The UC Berkeley Botanical Gardens offer such diverse backdrops in one location. We started in the Asian garden with its serene paths and Japanese maples, moved through the Mediterranean section with its soft grasses, and ended in a sun-drenched meadow.

## Styling Tips for Maternity Sessions

Sarah wore flowing fabrics that moved beautifully in the breeze and accentuated her baby bump without being too fitted. Soft, neutral colors photograph wonderfully in natural settings and won't distract from the emotion of the images.

## The Connection

What I love most about this session is the quiet intimacy we captured. The gentle way Sarah cradles her bump, the soft smile as she thinks about meeting her baby—these are the moments that matter.

## A Note to Sarah

I've watched you grow into the most amazing woman, and I know you're going to be an incredible mother. Thank you for letting me document this chapter of your journey. This baby is already so loved!`,

  // Sarah, Jonathan and Noah
  cmi2st9np00cz8zpwazosdd8a: `This winter I reconnected with a friend from high school and photographed her beautiful family. We went to the Lafayette Reservoir and explored the docks. Noah just turned 1! It was fun running around photographing him. He's so cute!!

## The Joy of Reconnection

There's something special about reconnecting with old friends and meeting the families they've built. Sarah and I hadn't seen each other in years, but photography has a way of bringing people together.

## Location: Lafayette Reservoir

The Lafayette Reservoir is one of my favorite spots in the East Bay for family sessions. The wooden docks provide beautiful leading lines, the water adds a calming backdrop, and there's plenty of open space for little ones to explore.

## Photographing Toddlers

Noah had just turned one, which is both a challenging and rewarding age to photograph. He's mobile and curious about everything, which means you get great candid moments but have to stay on your toes! I always tell parents to embrace the chaos—those genuine moments of discovery and play make for the best photos.

## Tips for Winter Sessions

Winter light is soft and flattering, but you do need to work around shorter days. We scheduled our session for late afternoon to catch that beautiful golden hour light. The bare trees and fallen leaves added a cozy, seasonal feel to the images.

## What I Love About Family Photography

Every family has their own rhythm and dynamic. Watching Sarah and Jonathan with Noah—the way they make him laugh, the gentle redirections, the shared glances of parental teamwork—reminded me why I love what I do. These connections are what make family photography so meaningful.`,

  // Melissa, Colin and Mylo
  cmi2ss9yw00ch8zpw45l2ulzq: `My friends Melissa and Colin welcomed sweet baby Mylo into this world and she is absolutely precious, a beautiful mini version of Mel. I'm so happy for them and I can't wait for our babies to share happy memories together as they grow up. We spent some time in Mylo's room, taking in the quiet newborn moments.

## The Magic of Newborn Photography

There's nothing quite like the first few weeks with a newborn. Everything is so new and precious—those tiny fingers, the milk-drunk smiles, the way they curl up like they're still in the womb. These moments are fleeting, which is why I always encourage parents to document them early.

## In-Home Session Benefits

We did this session in Melissa and Colin's home, which I love for newborn photography. The baby is comfortable in their familiar environment, all the necessities are within reach, and we get to document the nursery that the parents put so much love into creating.

## Lighting the Nursery

Natural window light is your best friend for newborn sessions. We positioned Mylo near the window in her nursery, and the soft, diffused light was perfect for capturing her delicate features without harsh shadows.

## Capturing Connection

Beyond the posed sleeping baby shots, I love capturing the connection between new parents and their baby. The way Colin looks at his daughter with wonder, Melissa's gentle nursing moments, the tentative first-time-parent touches—these images tell the story of a family forming.

## To New Parents

The newborn phase goes by in a blur of sleepless nights and endless feeds. These photos will be a treasured reminder of how small your baby once was and how your family looked in those first magical days.`,

  // Lauren+Adam // Lake Tahoe
  cmi2sxp6f00gm8zpwkvobykwl: `I had a lovely time chasing the light with these two in Sand Harbor in Lake Tahoe. Adam and Lauren are an adorable couple. I've known Adam for a long time and I'm so happy to see him so in love. This shoot makes me want to go back and wish I had taken my own engagement photos in the snow. ;) Super cute!

## Sand Harbor Magic

Sand Harbor in Lake Tahoe is one of those locations that takes your breath away. The crystal-clear water, the smooth granite boulders, and the surrounding pine forests create a backdrop that needs little enhancement.

## Winter Engagement Sessions

There's something incredibly romantic about engagement photos in the snow. The winter landscape strips everything back to its essentials—just the couple, the dramatic scenery, and the crisp mountain air. Lauren and Adam embraced the cold weather with such enthusiasm!

## Tips for Winter Shoots

If you're considering a winter engagement session, here are my tips: dress in layers (you can always remove some), bring warm beverages for breaks, wear practical footwear for the terrain, and embrace the cold—the rosy cheeks and cozy cuddling make for beautiful images!

## The Golden Hour

We timed our session to capture the late afternoon light reflecting off the snow and water. The warm golden tones contrasted beautifully with the cool blues of the winter landscape. It's moments like these that remind me why Tahoe holds such a special place in my heart.

## Friendship and Photography

Photographing friends always feels different—there's a comfort and trust that allows for more authentic moments. Seeing Adam so happy and in love brought me such joy. Here's to Lauren and Adam and their beautiful journey ahead!`,

  // Garden in the fall
  cmi2t00o300ja8zpw4fvc7321: `One fall afternoon, my friend Kat Howland Payne and I wandered through the UC Botanical Garden in Berkeley. The leaves were just starting to turn. She is wearing a maxi dress from Shabby Apple.

I miss her dearly, she just moved to New York. I'm thankful for the time we got to spend together and wish her the best in her new adventures!

## Farewell Shoot

When a close friend moves away, you want to capture every last moment together. This session was as much about creating memories as it was about taking photos.

## The UC Botanical Garden

The UC Botanical Garden is a hidden treasure with an incredible variety of plants and landscapes. In fall, the garden transforms with pockets of golden foliage, adding warmth and depth to portraits.

## Styling Notes

Kat's maxi dress from Shabby Apple was perfect for the bohemian, ethereal vibe we were going for. The flowy fabric moved beautifully as we walked through the gardens, and the rich jewel tones complemented the autumn colors.

## Capturing Friendship

Some of my favorite images from this session are the candid moments—genuine laughter between shots, quiet contemplation on a garden bench. These photos remind me of our friendship and the easy comfort we share.

## Long-Distance Friendships

To Kat: distance doesn't diminish friendship. These photos will always remind me of our adventures together, and I know there are many more to come, even if they require a plane ticket now!`,

  // Last Sunset of the Year
  cmi2t7y4f00qn8zpw8vzxbfsv: `Last year I spent the last sunset of the year in Capitola with friends. The beach is a beautiful place... The sounds of the crashing waves soothe my soul. The colors in the sky fuel my imagination. Here is to another amazing year and a close to 2014. Resolutions are in place. Now to watch another great year come to an end and begin a new adventure.

## New Year's Eve Tradition

There's something poetic about watching the last sunset of the year. It's a moment of reflection, gratitude, and anticipation all rolled into one beautiful celestial display.

## Capitola Beach

Capitola is one of my favorite beach towns on the California coast. The colorful Venetian-style buildings, the historic wharf, and the intimate beach create a charming atmosphere that feels like stepping back in time.

## Photographing Sunsets

Every sunset is unique, and this one did not disappoint. The clouds caught fire with oranges, pinks, and purples that painted across the sky. I shot in manual mode, slightly underexposing to capture the rich colors, and used the rule of thirds to compose the horizon.

## The Company You Keep

Good friends make everything better. Sharing this moment with people I love, toes in the sand, watching the year fade into beautiful colors—it doesn't get better than this.

## Looking Forward

As I write this, I'm reminded that each year brings new adventures, new challenges, and new opportunities to grow. Photography has given me so much, and I'm grateful for every click of the shutter.

Here's to sunsets, friendships, and new beginnings!`,

  // Katie+Chase Engagement
  cmi2sohl1009q8zpw5xnudblr: `Katie and Chase are engaged and getting married next summer! I couldn't be more happy for them, they are a perfect match for each other. Katie and I met in college at our sorority and over the years I have seen Katie blossom into a beautiful dancer. I'm so glad we had the opportunity to shoot this day and capture some underwater magic.

## Underwater Engagement Session

When Katie mentioned she wanted to incorporate her dance background into her engagement photos, I knew we had to do something special. Water movement mimics dance beautifully—the way fabric floats, hair flows, and bodies become weightless creates images that feel like art.

## Technical Challenges

Underwater photography requires specialized equipment and careful planning. We used an underwater housing for my camera and worked with an assistant to ensure safety. Communication is key when you're both submerged!

## Katie's Dance Background

Katie has been dancing for years, and her body awareness translates beautifully into photography. She knows how to extend through her fingertips, point her toes, and create beautiful lines—skills that are only amplified underwater.

## The Love Story

What makes these images special isn't just the technical execution—it's the genuine love between Katie and Chase. Even underwater, their connection is palpable. The way he holds her, the trust she shows as they move together—it's beautiful to witness.

## Advice for Couples

If you're considering something unique for your engagement session, think about what makes you *you* as a couple. Incorporate hobbies, meaningful locations, or special skills. These personal touches create images that tell your unique love story.`,

  // Katie Underwater
  cmi2som88009y8zpwy0kvo7nn: `I'm exploring underwater photography and started a series on dancers and the way they move underwater. Here is my first image on my first attempt at photographing underwater. I really love how clothing and hair move underwater. It's also fun to attempt interesting poses that would otherwise be very hard to accomplish above ground.

## Diving Into a New Medium

Underwater photography has been on my creative bucket list for years. There's something magical about the way water transforms movement—everything becomes fluid, dreamlike, and gravity-defying.

## The Learning Curve

I'll be honest—my first underwater session was humbling. Managing buoyancy, camera settings, and communication with your subject all while holding your breath is no small feat! But the challenges make the victories that much sweeter.

## Why Dancers?

Dancers make the perfect subjects for underwater photography. Their body awareness, flexibility, and ability to hold poses allows them to create stunning shapes beneath the surface. The water adds a new dimension to movements they've practiced for years.

## Technical Notes

For this series, I'm shooting with a Canon in an underwater housing. Natural light from above creates beautiful, soft illumination, but timing is everything—you want enough light without harsh surface reflections.

## The Vision

I see this as an ongoing series exploring the intersection of dance and water. Each session teaches me something new, and I'm excited to continue pushing the boundaries of what's possible.

Stay tuned for more images from this underwater journey!`,

  // Sarah in field of yellow flowers
  cmi2skqk5006a8zpwl1mc178l: `Dear baby girl, we are waiting for your beautiful arrival. I enjoyed time with your mama wandering in a field of flowers. Before we were all grounded to our houses. It's a good time to be grounded, I have a feeling you'll be an earth willow like your mama. Here is part 1 of our gorgeous spring hike exploring the local hills.

## Spring Maternity Magic

There's no better time for a maternity session than spring. The world is waking up, flowers are blooming, and there's a sense of new beginnings in the air—perfectly mirroring the anticipation of welcoming a new life.

## Location: Local Hills

The East Bay hills transform every spring with carpets of wildflowers. We found this stunning field of yellow blooms and spent the golden hour wandering through them. Sarah looked absolutely radiant against the vibrant backdrop.

## The Significance of Timing

We shot this session right before the world changed dramatically. Looking back at these images feels especially poignant—a beautiful moment of peace and anticipation captured just in time.

## Wardrobe Choices

Sarah wore a flowing dress that complemented the natural surroundings. The soft, earthy tones blended beautifully with the yellow flowers while still allowing her baby bump to be the star of the show.

## To the Mama-to-Be

Sarah, your calm and grounded energy is going to serve you so well in motherhood. I can already tell this little girl is going to be surrounded by so much love and nature.

Part 2 of this series coming soon with more stunning hillside views!`,

  // Sarah Part 2
  cmi2skgyd00618zpw9sq9wb7s: `Here are a few of my favorite images from the second part of our earthly session in the gorgeous hills of Walnut Creek, CA. The east bay really has some stunning viewpoints and you can catch some pretty spectacular sunsets.

## Continuing the Journey

After exploring the flower fields, Sarah and I made our way to higher ground to chase the sunset. The rolling hills of Walnut Creek offer some of the best views of the Bay Area, and I knew we'd capture something special.

## Golden Hour Goals

The light during this session was absolutely perfect. That warm, golden glow that photographers dream about bathed everything in the most flattering light. Sarah's skin looked luminous, and her dress caught the light beautifully.

## East Bay Hidden Gems

I've lived in the East Bay for years, and I'm still discovering new spots. These hills are just a short drive from suburban neighborhoods, yet they feel miles away from civilization. It's this accessibility to natural beauty that I love about this area.

## Posing for Maternity

For the hilltop shots, I focused on poses that showcased both Sarah's bump and the sweeping landscape behind her. Silhouettes against the sunset sky created dramatic, artistic images that differ from the softer flower field photos.

## The Final Moments

As the sun dipped below the horizon, we captured those magical twilight shots where the sky turns purple and pink. It was the perfect way to end a perfect session.

Congratulations again, Sarah. I can't wait to meet your little one!`,

  // Happy Birthday Pirates of the Caribbean
  cmi2sl0a0006i8zpwm35bvxl7: `On March 18th, 1967 the Pirates of the Caribbean opened at Disneyland. It's one of my favorite rides and I can't wait to get on it when we first get to the park. I love all the details and notice something different every time I go. What's your favorite part?

## A Photographer's Love for Disney

As a photographer, I have a deep appreciation for the craftsmanship at Disney parks. The attention to detail in attractions like Pirates of the Caribbean is nothing short of extraordinary—every scene tells a story through lighting, set design, and atmosphere.

## The Art of Immersive Storytelling

Pirates of the Caribbean was revolutionary when it opened. The combination of Audio-Animatronics, water transport, and immersive theming created something entirely new in entertainment. It's this commitment to storytelling through environment that continues to inspire my own work.

## Photographing at Disney

Capturing the magic of Disney parks presents unique challenges. Low light conditions, moving boats, and crowds all require creative solutions. I love the challenge of photographing dark rides—when you nail it, the images transport viewers right back to the experience.

## My Favorite Details

Every time I ride Pirates, I notice something new. The fireflies in the bayou at the beginning. The incredibly lifelike movement of the auction scene. The way the lighting shifts as you go from peaceful to chaotic scenes. It's a masterclass in environmental storytelling.

## What's Your Favorite?

I'd love to hear from fellow Disney fans—what's your favorite detail in Pirates of the Caribbean? Drop a comment and let me know!`,

  // Christmas Cuddles
  cmi2sj0wn004k8zpwuzcba3hf: `Wishing you a very merry Christmas and a happy new year!

Rhys and Mimi are in adorable Hanna Andersson Christmas gnome pajamas. Each year I order the next size up for Rhys and each year they continue this pattern, so we have been rocking the same print for 4 years now! We went up to Tahoe to visit family and enjoy some much needed down time.

## A Holiday Tradition

There's something so special about continuing traditions through the years. These matching pajamas have become part of our family's Christmas story, and looking back at photos from previous years shows just how much the kids have grown.

## Photographing Your Own Family

As a photographer, I know how important it is to be present with my family during the holidays. I try to capture candid moments without letting the camera get in the way of actually experiencing the season. A few quick shots in good light, and then the camera goes down.

## Tips for Holiday Photos

If you want to capture better holiday photos of your family, here are my tips:
- Use natural window light whenever possible
- Don't worry about perfect poses—candid moments are more meaningful
- Coordinate (don't match exactly) everyone's outfits
- Take photos early in the day when everyone is fresh

## Tahoe at Christmas

Lake Tahoe is magical any time of year, but there's something extra special about it during the holidays. The snow-covered trees, cozy cabins with smoke rising from chimneys, and the crisp mountain air create the perfect setting for family memories.

## Wishing You Joy

From our family to yours, we hope your holiday season is filled with love, laughter, and plenty of cuddles. Here's to another year of adventures!`,

  // Selah in Paradise Part 1
  cmi2sike1003o8zpwnarnh0j9: `During my family vacation to Kauai, I met up with some locals and we shot some beautiful lifestyle imagery. I met Selah at sunrise at Shipwrecks beach near Poipu. We got caught in a little rain and typical with Kauai, it was gone 5 minutes later. It was such a stunning sunrise! Something about shooting somewhere new and in a different environment always fuels me creatively.

## Kauai: The Garden Isle

There's a reason they call Kauai the Garden Isle. The lush landscapes, dramatic cliffs, and pristine beaches create endless opportunities for stunning photography. As a photographer, visiting new locations is like drinking from a creative well.

## Connecting with Local Talent

One of my favorite things to do when traveling is connect with local creatives. Selah was recommended by a friend, and meeting her felt like reconnecting with an old friend. Her energy and ease in front of the camera made our sunrise session effortless.

## Shipwrecks Beach

Shipwrecks Beach near Poipu is named for an old ship that wrecked offshore years ago. The dramatic cliffs behind the beach and the powerful waves create incredible backdrops. We arrived before dawn to catch the first light painting the sky.

## Embracing the Weather

That brief rain shower could have derailed less experienced photographers. But in Hawaii, you learn to roll with the weather. The rain actually added dimension to our images—the way it caught the early light, the freshness it brought to the colors—it made our session unique.

## Traveling as a Photographer

My advice to fellow photographers: never travel without your camera, and always be open to spontaneous shoots. Some of my best work has come from unexpected opportunities while on vacation.

Stay tuned for Part 2 of this Kauai series!`,

  // Morning Session in the Redwoods
  cmi2sgtdx002c8zpw571wcc6a: `A beautiful morning session in the redwoods for the Foy family. This was photographed during spring, however this location year round is stunning and a great option with minimal hiking and dog friendly.

## Why I Love the Redwoods

There's something almost spiritual about being among the redwoods. The towering trees filter the light into soft, dappled patterns that are incredibly flattering for portraits. The sense of scale makes families feel small in the best way—part of something ancient and magnificent.

## The Foy Family

The Foys came ready to play and explore, which is exactly what I hope for in family sessions. The kids were curious about the forest, picking up pinecones and examining fern fronds. These genuine moments of discovery make for the most authentic images.

## Location Details

This particular redwood grove is one of my go-to spots in the Bay Area. It's easily accessible with a short walk from the parking area, making it perfect for families with young children or elderly family members. The trails are well-maintained and, as a bonus, your furry family members are welcome.

## Best Time to Shoot

Morning sessions in the redwoods are magical. The fog often lingers between the trees, creating an ethereal atmosphere that's impossible to replicate later in the day. The light is soft and even, eliminating harsh shadows that can be unflattering.

## Seasonal Considerations

While I shot this session in spring, the redwoods are gorgeous year-round. Summer offers green ferns, fall brings some color to the surrounding maples and oaks, and winter can bring dramatic fog and moody skies.

If you're considering a forest family session, reach out—I'd love to show you this magical place!`,

  // Sunset Session on Mount Diablo
  cmi2sh2gs00308zpwjmkr9byk: `I took this family to Mount Diablo in the early fall for a stunning sunset session. Temperatures are warm and the hills are golden and the location is right off the parking area.

## Mount Diablo: East Bay's Crown Jewel

Mount Diablo offers some of the most spectacular views in the Bay Area. On clear days, you can see from the Farallon Islands to the Sierra Nevada. For photography, the combination of rolling golden hills and sweeping vistas creates endless possibilities.

## Why Early Fall?

Early fall in California is magical. The summer heat starts to ease, but the hills retain their golden color. The light takes on that warm quality that photographers dream about, and the chances of fog or clouds add drama to sunset shots.

## Session Flow

We met about two hours before sunset to give us plenty of time. We started with some playful family shots in the grassy meadows, then moved to rocky outcrops for more dramatic compositions. As the sun began to set, we positioned the family for those coveted golden hour portraits.

## Location Accessibility

One thing I love about this particular spot is how accessible it is. We were just steps from the parking area, which is perfect for families with young children or anyone who prefers not to hike. You don't need to go far to find stunning backdrops.

## The Golden Hour

Those final 30 minutes before sunset were pure magic. The light turned everything to gold, the sky began to color, and the family's joy was palpable. These are the moments I live for as a photographer.

If Mount Diablo is calling to you for your family session, let's make it happen!`,

  // Sunset in the Mount Diablo foothills (the Jentry family one)
  cmi2se9dv00078zpwtcghh4x8: `Jentry and her family were just the cutest to photograph. We had a great time wandering the foothills of Mount Diablo in Walnut Creek. Her dress is a part of my client closet and it goes nicely with any special photo shoot. Congrats to them welcoming baby girl very soon!

## The Foothills at Golden Hour

The foothills around Mount Diablo offer that quintessential California landscape—rolling golden hills dotted with oak trees, with dramatic mountain views in the distance. During golden hour, everything glows with warm, honeyed light.

## About My Client Closet

I maintain a wardrobe of beautiful dresses and accessories for clients to use during their sessions. The dress Jentry wore is one of my favorites—it photographs beautifully, flatters various body types, and works for multiple seasons. Having access to a client closet takes the stress out of "what to wear" decisions!

## Family Maternity Sessions

I love when couples choose to include their family in maternity sessions. It's not just about documenting the pregnancy—it's about capturing this moment of transition for the whole family. The older children get to be part of welcoming their sibling, and the images become treasured family heirlooms.

## Working with Kids and Expectant Mamas

My approach with family maternity sessions is to let the kids be kids. We don't force poses or expect toddlers to stand still. Some of my favorite images come from genuine moments of family connection—a kiss on mama's belly, holding hands while walking, spontaneous giggles.

## The Anticipation

There's a special energy to maternity sessions—the excitement and anticipation of meeting someone new. Jentry radiated this joy, and I hope these images serve as beautiful reminders of this chapter in their family story.

Congratulations to the whole family on the newest addition!`,
}

async function main() {
  console.log('Starting blog content enrichment...\n')

  let updated = 0
  let skipped = 0

  for (const [postId, newContent] of Object.entries(enrichedContent)) {
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { id: true, title: true, content: true },
    })

    if (!post) {
      console.log(`⚠️  Post not found: ${postId}`)
      skipped++
      continue
    }

    // Only update if new content is significantly longer
    if (newContent.length > post.content.length * 1.5) {
      await prisma.blogPost.update({
        where: { id: postId },
        data: { content: newContent },
      })
      console.log(`✅ Updated: ${post.title}`)
      console.log(
        `   ${post.content.length} chars → ${newContent.length} chars\n`
      )
      updated++
    } else {
      console.log(
        `⏭️  Skipped (content not significantly longer): ${post.title}`
      )
      skipped++
    }
  }

  console.log(`\nDone! Updated ${updated} posts, skipped ${skipped}`)
  await prisma.$disconnect()
}

main().catch(console.error)
