<?php
declare(strict_types=1);
return json_decode(<<<'FAQDATA'
{
  "entries": [
    {
      "id": "residence.types",
      "topic": "residence",
      "status": "source_checked",
      "official_approval": false,
      "source": {
        "document": "RESIDENCE PERMIT  GUIDELINES.pdf",
        "pages": [
          3
        ]
      },
      "questions": [
        "aina za vibali vya kuishi",
        "residence permit types",
        "types of residence permits",
        "Nahitaji kibali gani cha kuishi"
      ],
      "answers": {
        "sw": "Vibali vya kuishi vina makundi matatu: Class A kwa wageni waliojiajiri au wawekezaji, Class B kwa wageni walioajiriwa kwenye kampuni au taasisi binafsi, na Class C kwa makundi mengine kama watafiti, wastaafu, wamisionari na watu wa kujitolea. Unakuja kwa shughuli gani?",
        "en": "Residence permits have three classes: Class A for self-employed foreigners or investors, Class B for expatriates employed by companies or private institutions, and Class C for other categories such as researchers, retirees, missionaries and volunteers. What activity will you be coming for?"
      }
    },
    {
      "id": "residence.apply",
      "topic": "residence",
      "status": "source_checked",
      "official_approval": false,
      "source": {
        "document": "RESIDENCE PERMIT  GUIDELINES.pdf",
        "pages": [
          1,
          2,
          3
        ]
      },
      "questions": [
        "jinsi ya kuomba kibali cha kuishi",
        "how to apply for a residence permit",
        "residence permit application"
      ],
      "answers": {
        "sw": "Kama shughuli yako inahitaji Work Permit, anza maombi ya pamoja kupitia kazi.go.tz. Baada ya idhini ya Work Permit, fuata hatua za Residence Permit kwenye mfumo wa Uhamiaji. Kama huhitaji Work Permit, tumia Online Residence Permit Application kupitia e-Services kwenye immigration.go.tz, fungua akaunti, jaza fomu na ambatisha nyaraka zilizothibitishwa.",
        "en": "If your activity requires a Work Permit, start the combined application through kazi.go.tz. After Work Permit approval, follow the Residence Permit steps in the Immigration system. If no Work Permit is required, use Online Residence Permit Application under e-Services at immigration.go.tz, create an account, complete the form and attach certified documents."
      }
    },
    {
      "id": "residence.track",
      "topic": "residence",
      "status": "source_checked",
      "official_approval": false,
      "source": {
        "document": "RESIDENCE PERMIT  GUIDELINES.pdf",
        "pages": [
          3
        ]
      },
      "questions": [
        "kufuatilia kibali cha kuishi",
        "residence permit application status",
        "track residence permit"
      ],
      "answers": {
        "sw": "Ingia kwenye akaunti yako ya maombi. Submitted Application Status huonyesha hali ya ombi; Pending Application ni sehemu ya kuona na kujibu maombi ya taarifa au nyaraka zinazokosekana; Pending Payment huonyesha maelekezo ya malipo.",
        "en": "Sign in to your application account. Submitted Application Status shows progress; Pending Application lets you view and respond to requests for missing information or documents; Pending Payment shows payment instructions."
      }
    },
    {
      "id": "residence.enrolment",
      "topic": "residence",
      "status": "source_checked",
      "official_approval": false,
      "source": {
        "document": "RESIDENCE PERMIT  GUIDELINES.pdf",
        "pages": [
          2,
          3
        ]
      },
      "questions": [
        "alama za vidole kibali cha kuishi",
        "residence permit fingerprints",
        "residence permit enrolment"
      ],
      "answers": {
        "sw": "Baada ya malipo, utapokea Residence Permit Enrolment Notification. Fuata maelekezo yake ya kufika Ofisi ya Uhamiaji kwa kuchukuliwa alama za vidole na picha.",
        "en": "After payment, you will receive a Residence Permit Enrolment Notification. Follow its instructions to attend an Immigration Office for fingerprints and a photograph."
      }
    },
    {
      "id": "residence.missing",
      "topic": "residence",
      "status": "source_checked",
      "official_approval": false,
      "source": {
        "document": "RESIDENCE PERMIT  GUIDELINES.pdf",
        "pages": [
          3
        ]
      },
      "questions": [
        "nyaraka pungufu kibali cha kuishi",
        "residence permit missing documents",
        "incomplete residence permit application"
      ],
      "answers": {
        "sw": "Ukikosa taarifa au nyaraka kwenye ombi, utaarifiwa kupitia mfumo wa Residence Permit au email ya akaunti yako. Angalia Pending Application na jibu hoja au ambatisha nyaraka zilizoombwa ili ombi liendelee.",
        "en": "If information or documents are missing, you will be notified through the Residence Permit system or your account email. Check Pending Application and respond to the query or provide the requested documents so processing can continue."
      }
    },
    {
      "id": "residence.before",
      "topic": "residence",
      "status": "source_checked",
      "official_approval": false,
      "source": {
        "document": "RESIDENCE PERMIT  GUIDELINES.pdf",
        "pages": [
          1,
          4
        ]
      },
      "questions": [
        "kuomba kibali kabla ya kuingia Tanzania",
        "apply residence permit before entering Tanzania",
        "residence permit application from abroad"
      ],
      "answers": {
        "sw": "Maombi ya Residence Permit yanapaswa kuwasilishwa ukiwa nje ya Tanzania na kuidhinishwa kabla ya kuingia nchini. Kama tayari upo nchini na hali yako ni tofauti, wasiliana na Idara ya Uhamiaji kupitia info@immigration.go.tz kwa mwongozo wa kesi yako.",
        "en": "Residence Permit applications should be submitted while you are outside Tanzania and approved before entry. If you are already in the country and your circumstances differ, contact info@immigration.go.tz for guidance on your case."
      }
    }
  ]
}
FAQDATA, true, 512, JSON_THROW_ON_ERROR)['entries'];
