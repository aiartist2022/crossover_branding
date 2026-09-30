"""Site content: projects (from WEBSITE IMAGES/BRANDING/STATICS/BRANDING & IDENTITY) and studio copy.

Each project lists the source image numbers from that folder; the first is the cover.
`feature` is the crop centre (x, y as 0–1) used for full-bleed slides and cards.
Project blurbs describe only what the images show — review before launch.
"""

SRC = '/Users/crossoverproductions/Desktop/WEBSITE IMAGES/BRANDING/STATICS/BRANDING & IDENTITY/'

PROJECTS = [
    dict(slug='manhout', name='Manhout', kind='Handmade ceramics',
         services=['Brand Identity', 'Packaging', 'Stationery'],
         imgs=[1, 2, 3, 4, 5], featured=True, feature=(.5, .5),
         blurb='A brand identity for Manhout, a maker of handmade, high-quality ceramics. A bilingual '
               'wordmark, a sculptural monogram and a muted palette of clay, sage and wine carry the '
               'craft through packaging, stationery and art direction.'),
    dict(slug='theda', name='THEDA', kind='The Healthy Dimension',
         services=['Brand Identity', 'Packaging', 'Campaign'],
         imgs=[17, 16, 14, 15, 18, 19, 20], featured=True, feature=(.55, .5),
         blurb='Identity, packaging and launch campaign for THEDA — The Healthy Dimension, a '
               'science-led supplement brand. A precise wordmark, the THD monogram and a restrained '
               'black, sand and olive system run from bottles and boxes to out-of-home.'),
    dict(slug='pet-matters', name='Pet Matters', kind='Pets love’n it',
         services=['Brand Identity', 'Packaging', 'Stationery'],
         imgs=[34, 38, 39, 40], featured=True, feature=(.45, .55),
         blurb='A warm, hand-lettered identity for Pet Matters. The “Pets love’n it” line '
               'becomes the brand’s voice across kraft bags, pouches, cups and a full stationery suite.'),
    dict(slug='industrial-wayfinding', name='Industrial Wayfinding', kind='Production facility',
         services=['Wayfinding', 'Signage', 'Environmental'],
         imgs=[45, 47, 46, 48], featured=True, feature=(.45, .55),
         blurb='A bilingual wayfinding system for a production facility — zone markers, hanging '
               'line signs, floor graphics and parking identification that bring order to the floor.'),
    dict(slug='refreshify', name='Refreshify', kind='Personal care wipes',
         services=['Brand Identity', 'Packaging', 'Social'],
         imgs=[6, 7, 12, 9, 10, 11, 13, 8, 35], featured=True, feature=(.5, .6),
         blurb='Brand identity and a full packaging range for Refreshify wipes, from everyday and body '
               'wipes to specialist variants, with a flexible system for retail and social.'),
    dict(slug='commercial-wayfinding', name='Commercial Wayfinding', kind='Mixed-use development',
         services=['Wayfinding', 'Signage', 'Environmental'],
         imgs=[52, 51, 49, 50, 53, 54, 56, 55], featured=True, feature=(.5, .45),
         blurb='Commercial wayfinding from the street to the lift lobby — pylons, map totems, '
               'floor identifiers and directional signage, designed as one bilingual family.'),
    dict(slug='sal', name='SAL', kind='Delivering impact',
         services=['Environmental Branding', 'Wayfinding'],
         imgs=[29, 30, 31, 32], feature=(.5, .5),
         blurb='Environmental branding and wayfinding for SAL’s logistics facilities — bold red '
               'architecture graphics, gate pylons and bilingual information signs.'),
    dict(slug='orizon', name='ORIZON', kind='Naming & identity',
         services=['Naming', 'Brand Identity', 'Brand Values'],
         imgs=[22, 23, 24, 21], feature=(.5, .5),
         blurb='Name, identity and brand values for ORIZON — a confident letter system in violet, '
               'yellow and black, extended into stationery and values posters.'),
    dict(slug='blue-skies', name='Blue Skies', kind='For the love of fresh',
         services=['Brand Identity', 'Packaging', 'Campaign'],
         imgs=[59, 57, 58, 37, 60], feature=(.5, .5),
         blurb='Identity, bottle and campaign visuals for Blue Skies juices — a hand-drawn wordmark '
               'and a fresh-fruit art direction built for shelf and social.'),
    dict(slug='africa', name='Africa', kind='Control them.',
         services=['Brand Identity', 'Campaign', 'Stationery'],
         imgs=[41, 42, 44, 43], feature=(.5, .5),
         blurb='Brand identity and campaign for Africa, a pest-control company. “Control them before '
               'they control your life” leads a bold green system across print and stationery.'),
    dict(slug='serb', name='SERB', kind='Brand identity',
         services=['Brand Identity', 'Stationery'],
         imgs=[25, 26, 27, 28], feature=(.5, .5),
         blurb='A bilingual identity for SERB, built on a sweeping flight-path shape in violet and '
               'orange that carries across stationery and brand collateral.'),
    dict(slug='albadia', name='Albadia', kind='Pure white sugar',
         services=['Packaging'],
         imgs=[36], feature=(.4, .5),
         blurb='Packaging for Albadia pure white sugar — a clean bilingual pack that lets the product show.'),
    dict(slug='donuts-and-more', name='Donuts & More', kind='Donut shop',
         services=['Brand Identity', 'Packaging'],
         imgs=[33], feature=(.5, .5),
         blurb='A playful bilingual identity and box design for Donuts & More.'),
]

SERVICES = [
    ("Discovery", "The comprehensive immersion into every facet of a brand's business.",
     ["Understand your competitive market position.",
      "Know what influences your brand's perception, both internally and externally.",
      "Every recommendation, rooted in a deep understanding of your brand."]),
    ("Brand Platform", "The brand messaging system from which all other components of a brand are built.",
     ["Who your brand is.", "Why your brand matters.", "Why your brand is different.",
      "Why your audience should believe in your brand."]),
    ("Brand Architecture", "The formation of a brand's portfolio of offerings.",
     ["What your brand offers.", "Why each offering matters.", "How each offering is unique and related.",
      "Why your audience can believe that each offering should only come from your brand."]),
    ("Brand Naming", "The shorthand method for verbal and written communication.",
     ["What your brands are called.", "Why your brand matters.", "Why each brand name is appropriate.",
      "What each brand name means."]),
    ("Visual Expression", "The visual assets that communicate a brand's personality and perspective.",
     ["Visually differentiate your brand.", "Consistently communicate a brand's visual system.",
      "Inform a brand experience across a variety of touchpoints."]),
    ("Brand Execution", "The implementation of a brand strategy through communication devices across multiple channels.",
     ["Present a unified brand experience.",
      "Leverage branded communication devices to reinforce your brand value to each audience.",
      "Communicate your brand story through tools that are optimal for your industry, market and customer."]),
    ("Brand Alignment", "The union of employees, investors, advocates and other internal stakeholders around a common set of practices that informs how they communicate on behalf of a brand.",
     ["Protect your brand from internal misunderstanding.", "Ensure stakeholders know and believe your brand story.",
      "Empower internal audiences to leverage and promote your brand consistently as a team."]),
    ("Brand Extension", "Analysis of market opportunities to create new brand offerings.",
     ["Protect your brand from overextension.", "Predict competitive actions in evolving markets.",
      "Identify, rationalize and pursue new brand opportunities.",
      "Project a reinforced brand identity while growing market share."]),
]

PRACTICE = [
    ("Advertising", "Influences an audience through brief, repeated communication. Think TV commercials or billboards on the highway."),
    ("Marketing", "Influences an audience through direct, detailed communication. Think brochures or websites."),
    ("Public Relations", "Influences an audience through trusted third parties. Think press releases or speeches to industry experts."),
    ("Branding", "Defines exactly why an audience should trust and remember your advertising, marketing and public relations."),
]

SHIFT = [("old", "new"), ("static", "dynamic"), ("stagnant", "agile"), ("typical", "innovative"), ("unknown", "well-known")]

CONTACT = dict(
    phones=[('+91 95747 70099', 'tel:+919574770099'), ('+971 56 491 4000', 'tel:+971564914000')],
    emails=['purvak@crossoverproductions.ae', 'crossoverdesignsolutions@gmail.com'],
    instagram='https://www.instagram.com/crossover_studios/',
)
