// Parsed from the original gic.gitam.edu FAQ. Answers are arrays of paragraphs;
// inline links use [text](href) and are rendered by <RichText>.
export type FaqItem = { q: string; a: string[] };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

export const faqIntro = "Everything you need to know about GITAM X Bower Innovation Challenge 2026.";

export const faq: FaqGroup[] = [
  {
    "id": "about",
    "title": "About the Challenge",
    "items": [
      {
        "q": "What is the GITAM X Bower Innovation Challenge 2026?",
        "a": [
          "It is a national student innovation and pitching competition organised by the Venture Development Centre (VDC), GITAM, with Bower School of Entrepreneurship as the Title Sponsor. It gives young innovators a platform to present ideas, receive mentoring and venture coaching, improve pitches, and connect with the startup and innovation ecosystem."
        ]
      },
      {
        "q": "Who is organising the challenge?",
        "a": [
          "The competition is organised by the Venture Development Centre (VDC), GITAM, with Bower School of Entrepreneurship as the Title Sponsor and support from ecosystem partners."
        ]
      },
      {
        "q": "Who can participate?",
        "a": [
          "Junior Track: Students studying in Classes 10–12. Senior Track: Current undergraduate students and eligible recent graduates. Students from recognised institutions across India can participate, subject to the eligibility requirements of the respective track."
        ]
      },
      {
        "q": "Do I need to be studying at GITAM to participate?",
        "a": [
          "No. Students from eligible schools and colleges across India can participate. You do not need to be a GITAM student."
        ]
      }
    ]
  },
  {
    "id": "tracks",
    "title": "Tracks & Eligibility",
    "items": [
      {
        "q": "What is the Junior Track?",
        "a": [
          "The Junior Track is designed for school students in Classes 10–12 who have an innovative idea or early-stage concept."
        ]
      },
      {
        "q": "What is the Senior Track?",
        "a": [
          "The Senior Track is designed for undergraduate students and eligible recent graduates working on an idea, prototype, MVP or early-stage venture."
        ]
      },
      {
        "q": "How many members can be there in a team?",
        "a": [
          "Junior Track teams can have 2–4 members. Senior Track teams can have 2–6 members."
        ]
      },
      {
        "q": "Can students from different colleges form a team?",
        "a": [
          "For the Senior Track, students from eligible institutions can participate as a team, subject to the eligibility requirements. For the Junior Track, team members should be from the same school."
        ]
      },
      {
        "q": "Can students from different branches or departments form a team?",
        "a": [
          "Yes. Students from different academic backgrounds can form a team if they meet the eligibility requirements."
        ]
      },
      {
        "q": "Can students from different years form a team?",
        "a": [
          "Yes, provided all team members individually meet the eligibility criteria of the respective track."
        ]
      },
      {
        "q": "Can a team have more than two members?",
        "a": [
          "Yes. A Junior Track team can have up to four members and a Senior Track team up to six. However, only two members — the Lead and Co-Lead — will be invited to participate in the Grand Finale at GITAM Hyderabad."
        ]
      },
      {
        "q": "What if my team has more than 2 members?",
        "a": [
          "You can register with the Lead and Co-Lead as the two primary participants. The GITAM VDC team will collect the details of additional eligible members separately and provide certificates to them."
        ]
      },
      {
        "q": "Will other team members receive certificates if they do not attend the Grand Finale?",
        "a": [
          "Yes. All registered and eligible team members will receive participation certificates, even if only the Lead and Co-Lead attend the Grand Finale."
        ]
      }
    ]
  },
  {
    "id": "ideas",
    "title": "Ideas & Themes",
    "items": [
      {
        "q": "What kind of ideas can be submitted?",
        "a": [
          "Technology and non-technology ideas are welcome. We are looking for ideas that address meaningful problems and have potential to create real-world impact."
        ]
      },
      {
        "q": "Do I need a working prototype?",
        "a": [
          "No. A prototype is not compulsory. Junior Track participants can apply with a concept or early-stage idea. Senior Track participants can apply with an idea, prototype, MVP or early-stage venture."
        ]
      },
      {
        "q": "What are the five themes?",
        "a": [
          "Planet & Sustainability; Bio Economy & Agriculture; DeepTech & Manufacturing; Sports & Fitness; and D2C & Consumer Brands."
        ]
      },
      {
        "q": "Can I submit an idea that does not exactly fit one theme?",
        "a": [
          "Select the theme that is most closely related to your idea. The themes are broad and cover a wide range of sectors."
        ]
      },
      {
        "q": "Can non-technical ideas participate?",
        "a": [
          "Yes. Both technology and non-technology ideas are welcome."
        ]
      },
      {
        "q": "Can an existing startup participate?",
        "a": [
          "Yes, provided the team meets the Senior Track eligibility requirements and the venture is within the permitted stage."
        ]
      }
    ]
  },
  {
    "id": "registration",
    "title": "Registration",
    "items": [
      {
        "q": "How can I register?",
        "a": [
          "Register through the official portal: [Register for GIC 2026](/register). It takes four steps: 1) register your team, 2) submit your idea (details, pitch deck and video) in the team portal, 3) pay the registration fee on GEvents, 4) edit your submission any time until 31 October 2026. Payment is the last step: your entry is confirmed once it goes through."
        ]
      },
      {
        "q": "Where can I find more information?",
        "a": [
          "Visit the official GITAM Innovation Challenge website: [gic.gitam.edu](/)"
        ]
      },
      {
        "q": "When do I pay?",
        "a": [
          "At the end. First register your team and submit your idea (details, pitch deck and video) in the team portal. Then pay the registration fee on GEvents from the same portal. Your entry is confirmed once the payment goes through."
        ]
      },
      {
        "q": "What is the registration fee?",
        "a": [
          "Junior Track: ₹499 per team. Senior Track: ₹699 per team."
        ]
      },
      {
        "q": "Is the registration fee per student or per team?",
        "a": [
          "The fee is per team, not per student."
        ]
      },
      {
        "q": "Can I edit my registration after submitting it?",
        "a": [
          "If you need to make changes, please contact the GITAM VDC team through the official contact details on the website."
        ]
      },
      {
        "q": "What documents may be required?",
        "a": [
          "Shortlisted teams may be asked for Student ID, bonafide certificate/letter, school ID or principal's letter for Junior Track participants, and other documents required for eligibility verification."
        ]
      }
    ]
  },
  {
    "id": "selection",
    "title": "Submission & Selection",
    "items": [
      {
        "q": "What do I need to submit?",
        "a": [
          "Teams will submit their idea through the online registration process, including a short video pitch and pitch deck as specified in the registration guidelines."
        ]
      },
      {
        "q": "What happens after registration?",
        "a": [
          "Registration and Round 1 screening (deadline 31 October; results 2 November) → virtual bootcamp with a personal mentor (9–11 November) → Round 2 pitch deck (due 15 November; results 18 November) → online semi-finals (20 November for the Senior Track, 21 November for the Junior Track) → Grand Finale at GITAM Hyderabad on 11 December. Both tracks follow the same stages; only the semi-final dates differ."
        ]
      },
      {
        "q": "How are teams shortlisted?",
        "a": [
          "Submissions are reviewed by a jury based on factors such as the quality of the idea, relevance, completeness and quality of thinking. Round 1 results are announced on 2 November 2026, and the top 200 teams advance (100 from each track). After Round 2, the top 40 teams in each track go to the semi-finals."
        ]
      },
      {
        "q": "Will shortlisted teams receive mentoring?",
        "a": [
          "Yes. Every team that advances after Round 1 is paired with a personal mentor who helps refine the pitch deck for Round 2."
        ]
      },
      {
        "q": "What is the online bootcamp?",
        "a": [
          "A virtual bootcamp held online on 9–11 November 2026 for the teams that advance from Round 1. Its workshops cover business model validation, market sizing, financial modelling and pitch presentation skills. Teams then have 4 days to refine their pitch deck, and the Round 2 deck is due on 15 November 2026 at 11:59 PM IST."
        ]
      },
      {
        "q": "Will I get a venture coach?",
        "a": [
          "Every team advancing to the bootcamp is paired with a personal mentor. Longer-term 1:1 venture coaching is part of the benefits for winners (see Prizes)."
        ]
      }
    ]
  },
  {
    "id": "finale",
    "title": "Semi-Finals & Finale",
    "items": [
      {
        "q": "How do the semi-finals work?",
        "a": [
          "Semi-finals are online (video conferencing) for both tracks: 20 November 2026 for the Senior Track and 21 November 2026 for the Junior Track. Each team gets a 20-minute slot: 8 minutes to present, 10 minutes of Q&A with the panel and 2 minutes of buffer. The number of slides is up to you. The top 8 Senior Track teams and the top 6 Junior Track teams reach the Grand Finale."
        ]
      },
      {
        "q": "Will there be regional rounds?",
        "a": [
          "No. This year both tracks have online semi-finals, so no travel is needed before the Grand Finale."
        ]
      },
      {
        "q": "How many teams reach the Grand Finale?",
        "a": [
          "14 teams reach the Grand Finale on 11 December 2026: the top 8 from the Senior Track and the top 6 from the Junior Track. From them, the jury selects 6 Senior Track and 4 Junior Track teams (2 from each track are eliminated)."
        ]
      },
      {
        "q": "What is the pitch format at the Grand Finale?",
        "a": [
          "Each team gets 8 minutes to pitch and 10 minutes of Q&A with the jury. The number of slides is up to you."
        ]
      },
      {
        "q": "Where will the Grand Finale be held?",
        "a": [
          "The Grand Finale will be held at the GITAM Hyderabad Campus."
        ]
      },
      {
        "q": "When is the Grand Finale?",
        "a": [
          "11 December 2026."
        ]
      },
      {
        "q": "How many members from each finalist team can attend?",
        "a": [
          "Only two members — the Lead and Co-Lead — will be invited to participate in the Grand Finale."
        ]
      },
      {
        "q": "Will travel and accommodation be provided for finalists?",
        "a": [
          "Yes. Travel and accommodation support will be provided for eligible finalist teams travelling to GITAM Hyderabad for the Grand Finale. This support is applicable to the two invited finalist members (Lead and Co-Lead). Detailed travel and accommodation guidelines will be shared with selected finalists."
        ]
      },
      {
        "q": "Will food be provided to finalists?",
        "a": [
          "Food arrangements will be made for invited finalists as per the event arrangements and guidelines shared with selected teams."
        ]
      },
      {
        "q": "Do finalists have to pay for travel and accommodation?",
        "a": [
          "Travel and accommodation support will be provided for the two officially invited finalist members, subject to the event's travel guidelines and applicable limits."
        ]
      },
      {
        "q": "Can all team members travel to Hyderabad?",
        "a": [
          "Additional members may travel at their own cost. Official travel and accommodation support is applicable to the two invited finalist members."
        ]
      },
      {
        "q": "Can parents, faculty members or friends accompany finalists?",
        "a": [
          "They may travel separately, subject to visitor and accommodation arrangements. Official travel and accommodation support is only for the invited finalist members."
        ]
      }
    ]
  },
  {
    "id": "certificates",
    "title": "Certificates",
    "items": [
      {
        "q": "Will participants receive a certificate?",
        "a": [
          "Yes. Participation certificates will be provided to eligible registered team members."
        ]
      },
      {
        "q": "Will members who do not attend the Grand Finale receive certificates?",
        "a": [
          "Yes. Registered and eligible team members will receive participation certificates even if they do not attend the Grand Finale."
        ]
      },
      {
        "q": "If my team has more than two members but only two attend the Finale, will everyone receive certificates?",
        "a": [
          "Yes. All eligible registered team members will receive certificates."
        ]
      },
      {
        "q": "Will finalists receive special recognition?",
        "a": [
          "Finalists and award winners will receive recognition as per the competition's finalist and award categories."
        ]
      }
    ]
  },
  {
    "id": "prizes",
    "title": "Prizes & Benefits",
    "items": [
      {
        "q": "What is the total prize and ecosystem value?",
        "a": [
          "The competition offers ₹50 lakh+ in combined cash prizes and ecosystem/programme value, including mentoring, venture coaching, entrepreneurship programmes and incubation support."
        ]
      },
      {
        "q": "What are the Senior Track cash prizes?",
        "a": [
          "Winner – ₹2,00,000; Runner-up – ₹1,00,000; 2nd Runner-up – ₹50,000; People's Choice Award – ₹50,000; plus special awards including the Dr. G.V.V. Rao Young Engineer Dreamer Awards."
        ]
      },
      {
        "q": "What are the Junior Track prizes?",
        "a": [
          "Winner – ₹50,000; Runner-up – ₹30,000; 2nd Runner-up – ₹20,000."
        ]
      },
      {
        "q": "Is there support apart from cash prizes?",
        "a": [
          "Yes. Benefits include venture coaching, mentoring, pitch development support, entrepreneurship programmes, incubation opportunities, ecosystem connections, industry exposure, recognition and certificates."
        ]
      },
      {
        "q": "Is incubation support available?",
        "a": [
          "Yes. Selected Senior Track winners and other eligible finalists can receive incubation and venture-development support through the GITAM ecosystem as specified in the competition benefits."
        ]
      }
    ]
  },
  {
    "id": "students",
    "title": "For Students",
    "items": [
      {
        "q": "I only have an idea. Should I still apply?",
        "a": [
          "Absolutely. You do not need a fully developed startup. If you have identified a meaningful problem and have a solution you believe can create impact, you can participate."
        ]
      },
      {
        "q": "My idea is very early. Can I apply?",
        "a": [
          "Yes. The competition supports students at different stages, including early ideas."
        ]
      },
      {
        "q": "I don't know how to make a pitch deck. Can I still register?",
        "a": [
          "Yes. Shortlisted teams will receive guidance and mentoring to help improve their pitch and presentation."
        ]
      },
      {
        "q": "Do I need a registered company?",
        "a": [
          "No. Having a registered company is not a requirement to participate."
        ]
      },
      {
        "q": "Can I participate if I have never participated in a startup competition before?",
        "a": [
          "Yes. First-time participants are welcome."
        ]
      },
      {
        "q": "What will I gain even if I don't win?",
        "a": [
          "The competition is designed as a learning and venture-development journey, giving participants exposure to mentors, experts, pitching, entrepreneurship and the startup ecosystem."
        ]
      }
    ]
  },
  {
    "id": "finalists",
    "title": "Finalist Information",
    "items": [
      {
        "q": "Why are only two members invited to the Grand Finale?",
        "a": [
          "To ensure smooth event management and allow each finalist team to be represented on the main stage, only the Lead and Co-Lead will participate in the Grand Finale."
        ]
      },
      {
        "q": "What if the Lead is unavailable?",
        "a": [
          "The team should immediately inform the GITAM VDC team. Any change in designated representatives will be subject to organiser approval."
        ]
      },
      {
        "q": "Can other team members participate in preparing the pitch?",
        "a": [
          "Yes. Teams can involve all members in preparing their idea and presentation. Official Grand Finale representation will be limited to the Lead and Co-Lead."
        ]
      },
      {
        "q": "Will all team members be recognised?",
        "a": [
          "Yes. All eligible registered team members will be recorded as team members and receive participation certificates."
        ]
      },
      {
        "q": "Can I change team members after registration?",
        "a": [
          "Any change in team composition should be communicated to the organisers and will be subject to the competition guidelines."
        ]
      }
    ]
  },
  {
    "id": "general",
    "title": "General Questions",
    "items": [
      {
        "q": "Is the competition open across India?",
        "a": [
          "Yes. The competition is designed for eligible students from across India."
        ]
      },
      {
        "q": "Is there an age restriction?",
        "a": [
          "Eligibility is determined primarily by the academic category and track requirements. Students should meet the eligibility criteria for their track."
        ]
      },
      {
        "q": "Can international students participate?",
        "a": [
          "The current eligibility guidelines specify Indian students/citizens for participation. Contact the organisers if you have a specific eligibility question."
        ]
      },
      {
        "q": "Will the competition be online or offline?",
        "a": [
          "Everything is online until the finale: registration, screening, the bootcamp, mentoring and the semi-finals. Only the Grand Finale on 11 December is in person, at the GITAM Hyderabad campus."
        ]
      },
      {
        "q": "Where can I contact the organisers?",
        "a": [
          "Contact the Venture Development Centre (VDC), GITAM through the contact details provided on the official website."
        ]
      },
      {
        "q": "Where can I follow updates?",
        "a": [
          "Major announcements, timelines and updates will be shared through the official GITAM Innovation Challenge website and official communication channels."
        ]
      }
    ]
  }
];
