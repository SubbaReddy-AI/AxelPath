import {
  Mail,
  Phone,
  MapPin
} from "lucide-react";

import Container from "../common/Container";

function ContactInfo() {
  const information = [
    {
      icon: Mail,
      title: "Email",
      value: "AxelPath@gmail.com"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+91 7013888297"
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Hyderabad, Telangana, India"
    }
  ];

  return (
    <section className="section contact-info">
      <Container>
        <div className="contact-info-grid">
          {information.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="contact-info-card"
                key={item.title}
              >
                <Icon size={25} />

                <span>{item.title}</span>

                <strong>{item.value}</strong>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default ContactInfo;