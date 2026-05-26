// ABOUTME: Services section for homepage
// ABOUTME: Displays photography services with icons and descriptions

import { Camera, Users, Building2, Sparkles } from 'lucide-react'

const services = [
  {
    icon: Camera,
    title: 'Portrait Photography',
    description:
      'Capturing the essence of individuals and families with natural, timeless portraits that celebrate personality and connection.',
  },
  {
    icon: Users,
    title: 'Family Sessions',
    description:
      'Creating treasured memories with relaxed, joyful family portraits that showcase your unique bonds and relationships.',
  },
  {
    icon: Building2,
    title: 'Commercial Projects',
    description:
      'Professional imagery for businesses, products, and marketing campaigns that elevate your brand presence and impact.',
  },
  {
    icon: Sparkles,
    title: 'Creative Sessions',
    description:
      'Artistic and editorial work for unique projects that demand striking visual storytelling and creative vision.',
  },
]

function ServicesSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-5xl text-gray-900 dark:text-white md:text-6xl">
            Services
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Comprehensive photography services tailored to your vision and needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-8 transition-colors duration-300 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
            >
              <service.icon
                className="mb-6 h-10 w-10 text-gray-900 dark:text-white"
                strokeWidth={1.5}
              />
              <h3 className="mb-3 font-serif text-2xl text-gray-900 dark:text-white">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
