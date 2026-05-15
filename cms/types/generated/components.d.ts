import type { Schema, Struct } from '@strapi/strapi';

export interface ContentCalloutBox extends Struct.ComponentSchema {
  collectionName: 'components_content_callout_boxes';
  info: {
    description: 'Highlighted callout with variant styling (Info, Warning, Success)';
    displayName: 'Callout Box';
    icon: 'information';
  };
  attributes: {
    content: Schema.Attribute.Text;
    variant: Schema.Attribute.Enumeration<['Info', 'Warning', 'Success']> &
      Schema.Attribute.Required;
  };
}

export interface ContentCodeBlock extends Struct.ComponentSchema {
  collectionName: 'components_content_code_blocks';
  info: {
    description: 'Syntax-highlighted code snippet with language label';
    displayName: 'Code Block';
    icon: 'code';
  };
  attributes: {
    code: Schema.Attribute.Text;
    language: Schema.Attribute.String;
  };
}

export interface ContentHeroBlock extends Struct.ComponentSchema {
  collectionName: 'components_content_hero_blocks';
  info: {
    description: 'Full-width hero image with heading text';
    displayName: 'Hero Block';
    icon: 'landscape';
  };
  attributes: {
    headingText: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
  };
}

export interface ContentTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_content_text_blocks';
  info: {
    description: 'Rich text body content using Strapi Blocks editor';
    displayName: 'Text Block';
    icon: 'pencil';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
  };
}

export interface SharedCuratedItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_curated_items';
  info: {
    description: 'A manually curated featured content reference';
    displayName: 'Curated Item';
    icon: 'star';
  };
  attributes: {
    contentType: Schema.Attribute.Enumeration<
      ['Blogs', 'Projects', 'Engagements']
    > &
      Schema.Attribute.Required;
    targetId: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    description: 'A social media profile link';
    displayName: 'Social Link';
    icon: 'link';
  };
  attributes: {
    platformName: Schema.Attribute.Enumeration<
      ['LinkedIn', 'GitHub', 'X', 'StackOverflow']
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'content.callout-box': ContentCalloutBox;
      'content.code-block': ContentCodeBlock;
      'content.hero-block': ContentHeroBlock;
      'content.text-block': ContentTextBlock;
      'shared.curated-item': SharedCuratedItem;
      'shared.social-link': SharedSocialLink;
    }
  }
}
